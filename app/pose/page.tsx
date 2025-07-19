"use client";

// Copyright 2023 The MediaPipe Authors.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { useEffect, useRef, useState } from "react";
import {
    PoseLandmarker,
    FilesetResolver,
    DrawingUtils,
} from "@mediapipe/tasks-vision";

const PoseEstimationPage = () => {
    const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(
        null
    );
    const [webcamRunning, setWebcamRunning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [runningMode, setRunningMode] = useState<"IMAGE" | "VIDEO">("IMAGE");

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lastVideoTimeRef = useRef(-1);

    const videoHeight = 360;
    const videoWidth = 480;

    // Initialize MediaPipe
    useEffect(() => {
        const initializeMediaPipe = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );

                const landmarker = await PoseLandmarker.createFromOptions(
                    vision,
                    {
                        baseOptions: {
                            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
                            delegate: "GPU",
                        },
                        runningMode: runningMode,
                        numPoses: 2,
                    }
                );

                setPoseLandmarker(landmarker);
                setIsLoading(false);
            } catch (error) {
                console.error("Error creating pose landmarker:", error);
                setIsLoading(false);
            }
        };

        initializeMediaPipe();
    }, [runningMode]);

    // Handle image click for pose detection
    const handleImageClick = async (
        event: React.MouseEvent<HTMLImageElement>
    ) => {
        if (!poseLandmarker) {
            console.log("Wait for poseLandmarker to load before clicking!");
            return;
        }

        if (runningMode === "VIDEO") {
            setRunningMode("IMAGE");
            await poseLandmarker.setOptions({ runningMode: "IMAGE" });
        }

        const target = event.target as HTMLImageElement;
        const parentNode = target.parentNode as HTMLElement;

        // Remove all previous canvas elements
        const allCanvas = parentNode.getElementsByClassName("canvas");
        for (let i = allCanvas.length - 1; i >= 0; i--) {
            const canvas = allCanvas[i];
            canvas.parentNode?.removeChild(canvas);
        }

        // Detect pose and draw landmarks
        poseLandmarker.detect(target, (result: any) => {
            const canvas = document.createElement("canvas");
            canvas.setAttribute("class", "canvas");
            canvas.setAttribute("width", target.naturalWidth + "px");
            canvas.setAttribute("height", target.naturalHeight + "px");
            canvas.style.cssText = `
        position: absolute;
        left: 0px;
        top: 0px;
        width: ${target.width}px;
        height: ${target.height}px;
        pointer-events: none;
      `;

            parentNode.appendChild(canvas);
            const canvasCtx = canvas.getContext("2d");
            const drawingUtils = new DrawingUtils(canvasCtx!);

            for (const landmark of result.landmarks) {
                drawingUtils.drawLandmarks(landmark, {
                    radius: (data: any) =>
                        DrawingUtils.lerp(data.from?.z, -0.15, 0.1, 5, 1),
                });
                drawingUtils.drawConnectors(
                    landmark,
                    PoseLandmarker.POSE_CONNECTIONS
                );
            }
        });
    };

    // Check if webcam is supported
    const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

    // Enable/disable webcam
    const toggleWebcam = async () => {
        if (!poseLandmarker) {
            console.log("Wait! poseLandmarker not loaded yet.");
            return;
        }

        if (webcamRunning) {
            setWebcamRunning(false);
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach((track) => track.stop());
                videoRef.current.srcObject = null;
            }
        } else {
            setWebcamRunning(true);

            const constraints = { video: true };

            try {
                const stream = await navigator.mediaDevices.getUserMedia(
                    constraints
                );
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.addEventListener(
                        "loadeddata",
                        predictWebcam
                    );
                }
            } catch (error) {
                console.error("Error accessing webcam:", error);
                setWebcamRunning(false);
            }
        }
    };

    // Predict poses from webcam
    const predictWebcam = async () => {
        if (!canvasRef.current || !videoRef.current || !poseLandmarker) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;

        canvas.style.height = `${videoHeight}px`;
        video.style.height = `${videoHeight}px`;
        canvas.style.width = `${videoWidth}px`;
        video.style.width = `${videoWidth}px`;

        if (runningMode === "IMAGE") {
            setRunningMode("VIDEO");
            await poseLandmarker.setOptions({ runningMode: "VIDEO" });
        }

        const startTimeMs = performance.now();

        if (lastVideoTimeRef.current !== video.currentTime) {
            lastVideoTimeRef.current = video.currentTime;

            poseLandmarker.detectForVideo(video, startTimeMs, (result: any) => {
                const canvasCtx = canvas.getContext("2d");
                if (!canvasCtx) return;

                canvasCtx.save();
                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

                const drawingUtils = new DrawingUtils(canvasCtx);

                for (const landmark of result.landmarks) {
                    drawingUtils.drawLandmarks(landmark, {
                        radius: (data: any) =>
                            DrawingUtils.lerp(data.from?.z, -0.15, 0.1, 5, 1),
                    });
                    drawingUtils.drawConnectors(
                        landmark,
                        PoseLandmarker.POSE_CONNECTIONS
                    );
                }
                canvasCtx.restore();
            });
        }

        if (webcamRunning) {
            window.requestAnimationFrame(predictWebcam);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p>Loading MediaPipe Pose Landmarker...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-center mb-8">
                MediaPipe Pose Estimation
            </h1>

            {/* Demo 1: Click to detect poses in images */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">
                    Demo 1: Click on images to detect poses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Sample images for pose detection */}
                    <div className="detectOnClick relative">
                        <img
                            src="https://assets.codepen.io/9177687/woman-ge0f199f92_640.jpg"
                            alt="Person exercising"
                            className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={handleImageClick}
                            crossOrigin="anonymous"
                        />
                    </div>
                    <div className="detectOnClick relative">
                        <img
                            src="https://assets.codepen.io/9177687/woman-g1af8d3deb_640.jpg"
                            alt="Person doing yoga"
                            className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={handleImageClick}
                            crossOrigin="anonymous"
                        />
                    </div>
                    <div className="detectOnClick relative">
                        <img
                            src="https://assets.codepen.io/9177687/woman-ge0f199f92_640.jpg"
                            alt="Person running"
                            className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={handleImageClick}
                            crossOrigin="anonymous"
                        />
                    </div>
                </div>
                <p className="text-gray-600 mt-4">
                    Click on any image above to detect pose landmarks. The
                    detected poses will be overlaid on the images.
                </p>
            </section>

            {/* Demo 2: Live webcam pose detection */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">
                    Demo 2: Live webcam pose detection
                </h2>

                {hasGetUserMedia() ? (
                    <div className="text-center">
                        <button
                            onClick={toggleWebcam}
                            className={`px-6 py-3 rounded-lg font-semibold text-white mb-6 ${
                                webcamRunning
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-blue-500 hover:bg-blue-600"
                            } transition-colors`}>
                            {webcamRunning
                                ? "DISABLE PREDICTIONS"
                                : "ENABLE PREDICTIONS"}
                        </button>

                        <div className="relative inline-block">
                            <video
                                ref={videoRef}
                                id="webcam"
                                className="rounded-lg"
                                style={{
                                    width: videoWidth,
                                    height: videoHeight,
                                    transform: "rotateY(180deg)",
                                    WebkitTransform: "rotateY(180deg)",
                                    MozTransform: "rotateY(180deg)",
                                }}
                                autoPlay
                                playsInline
                            />
                            <canvas
                                ref={canvasRef}
                                id="output_canvas"
                                className="absolute top-0 left-0 rounded-lg"
                                style={{
                                    transform: "rotateY(180deg)",
                                    WebkitTransform: "rotateY(180deg)",
                                    MozTransform: "rotateY(180deg)",
                                }}
                                width={videoWidth}
                                height={videoHeight}
                            />
                        </div>

                        <p className="text-gray-600 mt-4">
                            Click the button above to enable your webcam and see
                            live pose detection.
                        </p>
                    </div>
                ) : (
                    <div className="text-center text-red-500">
                        <p>Your browser does not support webcam access.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default PoseEstimationPage;

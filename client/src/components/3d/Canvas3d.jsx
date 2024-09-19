import { Canvas } from "@react-three/fiber";
import { Experience } from "./Experience";

const Canvas3d = () => {
    return (
        <Canvas shadows camera={{ position: [3, 3, 3], fov: 30 }}>
            <color attach="background" args={["#ececec"]} />
            <Experience />
        </Canvas>
    );
}

export default Canvas3d;

import React, { Component } from "react";
import { Canvas, useFrame } from '@react-three/fiber'

export function SampleThree(props) {

  return <>
    <ambientLight intensity={0.1} />
    <mesh>
       <sphereGeometry args={[1, 32, 32]} />
       <meshStandardMaterial />
    </mesh>
  </>
}
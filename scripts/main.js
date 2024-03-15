import "../index.d.ts";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import * as MAPINFO from "./mapInfo.js";
import * as VORONOI from "./voronoi.js";
import * as MAP from "./map.js"
import Random from './other';
import UI from "./ui.js";

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ antialias:true, canvas, alpha:true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, window.innerWidth/window.innerHeight, 0.1, 100000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = false;
controls.update();

let ui = null;

export let mapPlane = null;
export let mapPlaneWireframe = null;

export let rng = null;
export let mapInfo = null;
export let voronoiMap = null;
export let worldMap = null;

Main();
function Main() {
    mapInfo = new MAPINFO.MapInfo();
    rng = new Random(mapInfo.GetSeed());
    worldMap = new MAP.WorldMap();
    voronoiMap = new VORONOI.VoronoiMap();

    ui = new UI();
    document.addEventListener("keyup", (event) => { const keyName = event.key; ui.OnInput(keyName); });

    mapPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(mapInfo.GetWidth(), mapInfo.GetHeight(), mapInfo.GetGridsX(), mapInfo.GetGridsY()),
        new THREE.MeshBasicMaterial({ color:0xffffff })
    );
    scene.add(mapPlane);
    camera.position.z = mapInfo.GetWidth();

    mapPlaneWireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry(mapPlane.geometry),
        new THREE.LineBasicMaterial({ color:0x000000 })
    );
    mapPlaneWireframe.visible = false;
    mapPlaneWireframe.position.z = 1;
    scene.add(mapPlaneWireframe);

    GenerateNoiseMap();
    GenerateVoronoiMap();
    ApplyTexture();
    RenderScene();
}

export function GenerateNoiseMap() {
    rng.SetRandNumGen(mapInfo.GetSeed());
    worldMap.Generate(mapInfo/*, structuredClone(voronoiMap.GetColorMap())*/);
}

export function GenerateVoronoiMap() {
    rng.SetRandNumGen(mapInfo.GetSeed());

    voronoiMap.GeneratePoints();
    voronoiMap.GenerateDiagrams();
}

export function ApplyTexture() {
    console.log("ApplyTexture start");
    
    let canvas = document.createElement('canvas');
    canvas.width = mapInfo.GetWidth();
    canvas.height = mapInfo.GetHeight();
    let context = canvas.getContext('2d');
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    let colorMapWorld = voronoiMap.GetColorMap();
    let colorMapNoise = worldMap.GetColorMap1();
    let voronoiCells = voronoiMap.GetCells();

    let colorMap = colorMapWorld;
    // let colorMap = colorMapNoise;

    // DRAW VORONOI CELL CENTERS
    for (let y = 0; y < mapInfo.GetGridsY(); y++) {
        for (let x = 0; x < mapInfo.GetGridsX(); x++) {
            // colorMap[voronoiCells[x][y].GetPoint().y * mapInfo.GetWidth() + voronoiCells[x][y].GetPoint().x] = new THREE.Color(0, 255, 0);
        }
    }

    let u = 0;
    for (let k = 0; k < imageData.data.length; k += 4) {
        if (colorMap[u] === undefined) {
            imageData.data[k]   = 255;
            imageData.data[k+1] = 0;
            imageData.data[k+2] = 255;
            imageData.data[k+3] = 255;
            // console.log("colorMap[" + u + "] undefined!");
            u++;
            continue;
        }

        imageData.data[k]   = colorMap[u].r;
        imageData.data[k+1] = colorMap[u].g;
        imageData.data[k+2] = colorMap[u].b;
        imageData.data[k+3] = 255;
        u++;
    }

    context.putImageData(imageData, 0, 0);
    let texture = new THREE.CanvasTexture(context.canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    mapPlane.material = new THREE.MeshBasicMaterial({ map: texture });
    
    console.log("ApplyTexture end");
}

function RenderScene() {
    requestAnimationFrame(RenderScene);
    renderer.render(scene, camera);
}

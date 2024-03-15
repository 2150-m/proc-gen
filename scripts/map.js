import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

import { rng } from './main';

export class WorldMap {
    #noise1    = new Array();
    #noise2    = new Array();
    #noiseMap1 = new Array();
    #noiseMap2 = new Array();
    #colorMap1 = new Array();
    #colorMap2 = new Array();
    
    #octaves     = 8;
    #scale       = 155;
    #persistance = 0.45;
    #lacunarity  = 2.05;
    #offset      = { x: 1, y: 1 };
    
    Generate(mapInfo/*, voronoiColorMap*/) {
        // this.#colorMap1 = voronoiColorMap;
        // if (this.#octaves == 0)
            // return;
        
        this.#noise1 = createNoise2D(alea(mapInfo.GetSeed() + rng.Range(-10000, 10000)));
        this.#noise2 = createNoise2D(alea(mapInfo.GetSeed() + rng.Range(-10000, 10000)));
        
        const mapWidth = mapInfo.GetWidth();
        const mapHeight = mapInfo.GetHeight();
        
        // credit: Sebastian Lague
        let octaveOffsets = new Array(this.#octaves);
        for (let i = 0; i < this.#octaves; i++)
            octaveOffsets[i] = {
                x: rng.Range(-100000, 100000) + this.#offset.x,
                y: rng.Range(-100000, 100000) + this.#offset.y 
            };
        
        if (this.#scale <= 0) this.#scale = 0.0001;
        
        this.#noiseMap1 = new Array(mapWidth);
        for (let k = 0; k < this.#noiseMap1.length; k++)
            this.#noiseMap1[k] = new Array(mapHeight);
        this.#noiseMap2 = structuredClone(this.#noiseMap1);
        
        let maxNoise1 = Number.MIN_VALUE;
        let minNoise1 = Number.MAX_VALUE;
        let maxNoise2 = Number.MIN_VALUE;
        let minNoise2 = Number.MAX_VALUE;
        
        // credit: Sebastian Lague
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                let amplitude = 1;
                let frequency = 1;
                let noiseHeight1 = 0;
                let noiseHeight2 = 0;
                
                for (let k = 0; k < this.#octaves; k++) {
                    let sampleX = (x - mapWidth  / 2) / this.#scale * frequency + octaveOffsets[k].x;
                    let sampleY = (y - mapHeight / 2) / this.#scale * frequency + octaveOffsets[k].y;
                    
                    noiseHeight1 += (this.#noise1(sampleX, sampleY) * 2 - 1) * amplitude;
                    noiseHeight2 += (this.#noise2(sampleX, sampleY) * 2 - 1) * amplitude;
                    
                    amplitude *= this.#persistance; 
                    frequency *= this.#lacunarity;
                }
                
                if (noiseHeight1 > maxNoise1)
                    maxNoise1 = noiseHeight1;
                else if (noiseHeight1 < minNoise1)
                    minNoise1 = noiseHeight1;
                
                if (noiseHeight2 > maxNoise2)
                    maxNoise2 = noiseHeight2;
                else if (noiseHeight2 < minNoise2)
                    minNoise2 = noiseHeight2;
                
                this.#noiseMap1[x][y] = noiseHeight1;
                this.#noiseMap2[x][y] = noiseHeight2;
            }
        }
        
        for (let y = 0; y < mapHeight; y++)
            for (let x = 0; x < mapWidth; x++) {
                this.#noiseMap1[x][y] = THREE.MathUtils.inverseLerp(minNoise1, maxNoise1, this.#noiseMap1[x][y]);
                this.#noiseMap2[x][y] = THREE.MathUtils.inverseLerp(minNoise2, maxNoise2, this.#noiseMap2[x][y]);
                // this.#noiseMap1[x][y] = InvLerp(minNoise1, maxNoise1, this.#noiseMap1[x][y]);
                // this.#noiseMap2[x][y] = InvLerp(minNoise2, maxNoise2, this.#noiseMap2[x][y]);
            }
            
        this.CreateNoiseColorMap(mapWidth, mapHeight);
    }
    
    CreateNoiseColorMap(mapWidth, mapHeight) {
        this.#colorMap1 = new Array(mapWidth * mapHeight);
        this.#colorMap2 = new Array(mapWidth * mapHeight);
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                this.#colorMap1[y * mapWidth + x] = ColorInRGB(this.#noiseMap1[x][y]);
                this.#colorMap2[y * mapWidth + x] = ColorInRGB(this.#noiseMap2[x][y]);
            }
        }
    }
    
    GetColorMap1()         { return this.#colorMap1; }
    SetColorMap1(colorMap) { this.#colorMap1 = colorMap; }
    GetColorMap2()         { return this.#colorMap2; }
    SetColorMap2(colorMap) { this.#colorMap2 = colorMap; }
    
    GetNoiseMap1()         { return this.#noiseMap1; }
    SetNoiseMap1(map)      { this.#noiseMap1 = map; }
    GetNoiseMap2()         { return this.#noiseMap2; }
    SetNoiseMap2(map)      { this.#noiseMap2 = map; }
    
    GetScale()               { return this.#scale; }
    GetOctaves()             { return this.#octaves; }
    GetLacunarity()          { return this.#lacunarity; }
    GetPersistance()         { return this.#persistance; }
    GetOffset()              { return this.#offset; }
    
    ChangeScale(value)       { this.#scale += value; }
    ChangeOctaves(value)     { this.#octaves += value; }
    ChangeLacunarity(value)  { this.#lacunarity += value; }
    ChangePersistance(value) { this.#persistance += value; }
    ChangeOffsetX(value)     { this.#offset.x += value; }
    ChangeOffsetY(value)     { this.#offset.y += value; }
}

function ColorInRGB(noiseMapValue) {
    let clr = new THREE.Color();
    clr.lerpColors(new THREE.Color(0, 0, 0), new THREE.Color(1,1,1), noiseMapValue);
    clr.r = ValueInRGBRange(clr.r);
    clr.g = ValueInRGBRange(clr.g);
    clr.b = ValueInRGBRange(clr.b);
    return clr;
}

function ValueInRGBRange(oldVal) {
    let oldMin = -1;
    let oldMax = 1;
    let newMin = 0;
    let newMax = 255;
    
    return ( (oldVal - oldMin) * (newMax - newMin) / (oldMax - oldMin) ) + newMin;
}

function InvLerp(min, max, oldVal) {
    let oldMin = min;
    let oldMax = max;
    let newMin = -1;
    let newMax = 1;
    
    return ( ( (oldVal - oldMin) * (newMax - newMin) ) / (oldMax - oldMin) ) + newMin;
}

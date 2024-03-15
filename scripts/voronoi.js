import * as THREE from 'three';
import { mapInfo, rng, worldMap } from './main.js';

const NEIGHBORNUM = 8;
let stopRec = false;

export class VoronoiMap {
    #cells = new Array();
    #colorMap = new Array();
    
    constructor() {
        this.#colorMap = new Array(mapInfo.GetHeight() * mapInfo.GetWidth());
    }
    
    GeneratePoints() {
        console.log("GeneratePoints start");
        
        const numOfGridsX = mapInfo.GetGridsX();
        const numOfGridsY = mapInfo.GetGridsY();
        const pixelsPerGrid = mapInfo.GetPixelsPerGrid();
        
        this.#cells = new Array(numOfGridsX);
        for (let i = 0; i < numOfGridsX; i++)
            this.#cells[i] = new Array(numOfGridsY);
        
        for (let y = 0; y < numOfGridsY; y++) {
            for (let x = 0; x < numOfGridsX; x++) {
                let posX = Math.floor(x * pixelsPerGrid + rng.Range(0, pixelsPerGrid - 1));
                let posY = Math.floor(y * pixelsPerGrid + rng.Range(0, pixelsPerGrid - 1));
                
                this.#cells[x][y] = new VoronoiCell(
                    new THREE.Vector2(posX, posY),
                                                    new THREE.Color(62, 134, 249)
                                                    // new THREE.Color(rng.Range(130, 200),rng.Range(130, 200),rng.Range(130, 200))
                );
            }
        }
        
        this.MarkEligibleCells(numOfGridsX, numOfGridsY, mapInfo.GetEdgeDistFactorX(), mapInfo.GetEdgeDistFactorY());
        let continentSizes = this.GenerateContinentSizes(mapInfo);
        
        for (let u = 0; u < mapInfo.GetInitLandCount(); u++) {
            let x = 0, y = 0;
            [ x, y ] = this.QuadrantRange();
            
            // let clr = new THREE.Color(rng.Range(40, 255), rng.Range(40, 255), rng.Range(40, 255));
            // let clr = new THREE.Color(74, 249, 62);
            let clr = new THREE.Color(255, 255, 255);
            this.#cells[x][y].SetColor(clr);
            continentSizes[u]--;
            
            stopRec = false;
            this.GrowContinent(continentSizes[u], x, y, new THREE.Color(clr.r - mapInfo.GetGrowthColorStep(), clr.g - mapInfo.GetGrowthColorStep(), clr.b - mapInfo.GetGrowthColorStep()), 0);
        }
        
        // for (let y = 0; y < numOfGridsY; y++)
        //     for (let x = 0; x < numOfGridsX; x++)
        //         if (this.#cells[x][y].IsEligibleForLand())
        //             this.#cells[x][y].SetColor(1)
        
        this.SetCells(this.#cells);
        
        console.log("GeneratePoints end");
    }
    
    // TODO tidy up
    GrowContinent(size, x, y, clr, depth) {
        // let tabs = "";
        // for (let i = 0; i < depth; i++)
        // tabs += "\t";
        // //console.log(tabs + "Depth: " + depth + ", size: " + size)
        
        if (size <= 0) {
            // //console.log(tabs + "Size is 0 at the beginning. Returning 0");
            return 0;
        }
        
        if (depth >= mapInfo.GetStopGrowth()) {
            stopRec = true;
            return size;
        }
        
        if (stopRec) {
            if (depth >= mapInfo.GetResumeGrowthLower() && depth <= mapInfo.GetResumeGrowthUpper()) {
                stopRec = false;
                // //console.log(tabs + "stopRec = true, depth == 2, returning " + size);
            }
            
            // //console.log(tabs + "stopRec = true, depth != 2, returning " + size);
            return size;
        }
        
        this.#cells[x][y].FindAllNeighbors(x, y);
        let neighbors = structuredClone(this.#cells[x][y].GetNeighbors());
        
        neighbors = neighbors.filter(e => {
            if (this.#cells[e.x][e.y].IsEligibleForLand() && !this.#cells[e.x][e.y].IsLand()
                && e.x < mapInfo.GetGridsX() && e.y < mapInfo.GetGridsY())
                return e;
        });
        
        if (neighbors.length == 0) {
            // //console.log(tabs + "No neighbors! " + size);
            stopRec = true;
            return size;
        }
        
        // Remove randoms so that only ~half of NEIGHBORNUM is left
        if (neighbors.length > NEIGHBORNUM / 2) {
            for (let i = neighbors.length - 1; i >= 0; i--) {
                neighbors.splice(rng.Range(0, i), 1);
                if (neighbors.length <= NEIGHBORNUM / 2)
                    break;
            }
        }
        
        for (let i = 0; i < neighbors.length; i++) {
            this.#cells[neighbors[i].x][neighbors[i].y].SetColor(clr);
            size--;
            if (size <= 0) {
                // //console.log(tabs + "Size is 0 in the neighbor coloring part.");
                return 0;
            }
        }
        for (let i = 0; i < neighbors.length; i++) {
            let next = rng.Range(0, neighbors.length - 1);
            this.GrowContinent(size, neighbors[next].x, neighbors[next].y, new THREE.Color(clr.r - mapInfo.GetGrowthColorStep(), clr.g - mapInfo.GetGrowthColorStep(), clr.b - mapInfo.GetGrowthColorStep()), depth + 1);
        }
        
        return size;
    }
    
    QuadrantRange(quadrant = 0, recursionCounter = 0) {
        console.log("QuadrantRange start");
        
        const gridsX = mapInfo.GetGridsX();
        const gridsY = mapInfo.GetGridsY();
        
        let x;
        let y;
        let offsetX = Math.ceil(gridsX * mapInfo.GetEdgeDistFactorX_Initial());
        let halfOffsetX = Math.round(offsetX / 2);
        let offsetY = Math.ceil(gridsY * mapInfo.GetEdgeDistFactorY_Initial());
        let halfOffsetY = Math.round(offsetY / 2);
        
        switch (quadrant) {
            case 0:
                x = rng.Range(1 + offsetX, gridsX / 2 - halfOffsetX); // always even
                y = rng.Range(1 + offsetY, Math.ceil(gridsY / 2) - halfOffsetY);
                quadrant++;
                break;
            case 1:
                x = rng.Range(gridsX / 2 + 1 + halfOffsetX, gridsX - 2 - offsetX);
                y = rng.Range(1 + offsetY, Math.ceil(gridsY / 2) - halfOffsetY);
                quadrant++;
                break;
            case 2:
                x = rng.Range(gridsX / 2 + 1 + halfOffsetX, gridsX - 2 - offsetX);
                y = rng.Range(Math.ceil(gridsY / 2) + 1 + halfOffsetY, gridsY - 2 - offsetY);
                quadrant++;
                break;
            default:
                x = rng.Range(1 + offsetX, gridsX / 2 - halfOffsetX);
                y = rng.Range(Math.ceil(gridsY / 2) + 1 + halfOffsetY, gridsY - 2 - offsetY);
                quadrant = 0;
        }
        
        if (!this.#cells[x][y].IsEligibleForLand() || this.#cells[x][y].IsLand()) {
            if (recursionCounter >= 100)
                return [ x, y ];
            
            return this.QuadrantRange(quadrant, recursionCounter);
        }
        
        console.log("QuadrantRange end");
        return [ x, y ];
    }
    
    MarkEligibleCells(numOfGridsX, numOfGridsY, edgeDistFactorX, edgeDistFactorY) {
        console.log("MarkEligibleCells start");
        
        let distX = Math.round(numOfGridsX * edgeDistFactorX);
        let distY = Math.round(numOfGridsX * edgeDistFactorY);
        
        // //console.log(distX)
        
        for (let y = 0; y < numOfGridsY; y++)
            for (let x = 0; x < numOfGridsX; x++)
                if (x >= distX && y >= distY && x <= numOfGridsX - 1 - distX && y <= numOfGridsY - 1 - distY)
                    this.#cells[x][y].SetEligibleForLand(true);
        
        console.log("MarkEligibleCells end");
        return this.#cells;
    }
    
    GenerateContinentSizes() {
        console.log("GenerateContinentSizes start");
        
        const numOfGridsX = mapInfo.GetGridsX();
        const numOfGridsY = mapInfo.GetGridsY();
        
        let initLandCount = mapInfo.GetInitLandCount();
        
        let totalLandCount = Math.floor(numOfGridsX * numOfGridsY * mapInfo.GetLandPercentage());
        //console.log("num of cells: " + numOfGridsX * numOfGridsY)
        //console.log("totalLandCount: " + totalLandCount)
        //console.log("initLandCount: " + initLandCount)
        
        let continentSizes = new Array(initLandCount);
        const sizeFactor = mapInfo.GetContinentSizeFactor();
        const startSize = Math.round(totalLandCount / initLandCount);
        const changePos = Math.ceil(startSize * sizeFactor);
        const changeNeg = -Math.round(changePos / 2);
        
        // //console.log("changePos: " + changePos + "\tchangeNeg: " + changeNeg);
        // //console.log("startSize: " + startSize);
        
        let leftovers = totalLandCount;
        for (let i = 0; i < initLandCount; i++) {
            if (i < initLandCount - 1) {
                let c = rng.Range(changeNeg, changePos);
                continentSizes[i] = startSize + c;
                if (continentSizes[i] <= 0)
                    continentSizes[i] = 1;
                
                leftovers -= continentSizes[i];
                // //console.log("continentSizes[" + i + "]\n\tchange: " + c);
            }
            else {
                continentSizes[i] = leftovers;
            }
            
            //console.log("\tsize: " + continentSizes[i]);
        }
        
        console.log("GenerateContinentSizes end");
        return continentSizes;
    }
    
    // Based on youtu.be/-fYI_5hQcOI?t=220, but fixed
    GenerateDiagrams() {
        console.log("GenerateDiagrams start");
        
        const numOfGridsX = mapInfo.GetGridsX();
        const numOfGridsY = mapInfo.GetGridsY();
        const pixelsPerGrid = mapInfo.GetPixelsPerGrid();
        const mapWidth = mapInfo.GetWidth();
        const mapHeight = mapInfo.GetHeight();
        
        for (let j = 0; j < mapHeight; j++) {
            for (let i = 0; i < mapWidth; i++) {
                let xGrid = Math.floor(i / pixelsPerGrid);
                let yGrid = Math.floor(j / pixelsPerGrid);
                
                let closest = Number.POSITIVE_INFINITY;
                let closestPoint = new VoronoiCell();
                
                for (let u = -2; u < 3; u++) {
                    for (let v = -2; v < 3; v++) {
                        let y = yGrid + u;
                        let x = xGrid + v;
                        if (x < 0 || y < 0 || x >= numOfGridsX || y >= numOfGridsY)
                            continue;
                        
                        let dist = new THREE.Vector2(i, j).distanceTo(this.GetCells()[x][y].GetPoint());
                        if (dist < closest) {
                            let offsetX = Math.round(worldMap.GetNoiseMap1()[i][j]);
                            let offsetY = Math.round(worldMap.GetNoiseMap2()[i][j]);
                            
                            let nx = x - offsetX;
                            if (!(nx < 0 || nx >= numOfGridsX))
                                x = nx;
                            let ny = y - offsetY;
                            if (!(ny < 0 || ny >= numOfGridsY))
                                y = ny;
                            
                            closest = dist;
                            closestPoint = this.GetCells()[x][y];
                            this.GetCells()[x][y].GetPixels().push(new THREE.Vector2(i, j));
                        }
                    }
                }
                
                this.#colorMap[j * mapWidth + i] = closestPoint.GetColor();
            }
        }
        
        console.log("GenerateDiagrams end");
    }
    
    GetCells()            { return this.#cells; }
    SetCells(cells)       { this.#cells = cells; }
    
    GetColorMap()         { return this.#colorMap; }
    SetColorMap(colorMap) { this.#colorMap = colorMap; }
}

export class VoronoiCell {
    #point = null;
    #color = null;
    #pixels = new Array();
    #isLand = false;
    #eligibleForLand = false;
    #allNeighbors = null; // only if land cell
    
    constructor(point, color) {
        this.#point = point;
        this.#color = color;
    }
    
    FindAllNeighbors(xCoord, yCoord) {        
        this.#allNeighbors = new Array();
        
        if (NEIGHBORNUM == 8) {
            for (let v = -1; v <= 1; v++) {
                for (let u = -1; u <= 1; u++) {
                    if (u == 0 && v == 0)
                        continue;
                    
                    this.#allNeighbors.push({ x: (xCoord+u), y: (yCoord+v) });
                }
            }
            
            return;
        }
        
        this.#allNeighbors.push({ x: xCoord,   y: yCoord-1 });
        this.#allNeighbors.push({ x: xCoord-1, y: yCoord   });
        this.#allNeighbors.push({ x: xCoord+1, y: yCoord   });
        this.#allNeighbors.push({ x: xCoord,   y: yCoord+1 });
    }
    
    SetToWater() {
        this.#isLand = false;
        this.#color = new THREE.Color(62, 134, 249);
    }
    
    SetToLand() {
        this.#isLand = true;
        this.#color = new THREE.Color(74, 249, 62);
    }
    
    GetPoint()                { return this.#point; }
    SetPoint(point)           { this.#point = point; }
    
    GetColor()                { return this.#color; }
    SetColor(clr, isLandMod = true) {
        this.#color = clr;
        this.#isLand = isLandMod;
    }
    
    GetPixels()               { return this.#pixels; }
    SetPixels(pixels)         { this.#pixels = pixels; }
    
    IsEligibleForLand()       { return this.#eligibleForLand; }
    SetEligibleForLand(value) { this.#eligibleForLand = value; }
    
    GetNeighbors()            { return this.#allNeighbors; }
    
    IsLand()                  { return this.#isLand; }
}

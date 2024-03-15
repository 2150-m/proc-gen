export class MapInfo {
    #height = 400;
    #width = this.#height * 2;
    #numOfGridsY = 35;
    #numOfGridsX = this.#numOfGridsY * 2;
    #pixelsPerGrid = this.#height / this.#numOfGridsY;

    #seed = -3;
    #initLandCount = 4;
    #continentSizeFactor = 0.5;
    #landPercentage = 0.21;
    #edgeDistFactorX = 0.16;
    #edgeDistFactorY = 0.05;
    #edgeDistFactorX_Initial = 0.3;
    #edgeDistFactorY_Initial = 0.45;
    
    #stopGrowth = 17;
    #resumeGrowth_Lower = 9;
    #resumeGrowth_Upper = 14;
    #growthColorStep = 10;

    GetHeight() { return this.#height; }
    GetWidth()  { return this.#width; }
    SetSize(height) {
        this.#height = height;
        this.#width = height * 2;
    }

    GetGridsX()        { return this.#numOfGridsX; }
    GetGridsY()        { return this.#numOfGridsY; }
    SetGrids(number) {
        this.#numOfGridsY = number;
        this.#numOfGridsX = number * 2;
    }

    GetPixelsPerGrid() { return this.#pixelsPerGrid; }

    GetSeed()                      { return this.#seed; }
    SetSeed(value)                 { this.#seed = value; }
    ChangeSeed(value)              { this.#seed += value; }

    GetInitLandCount()             { return this.#initLandCount; }
    SetInitLandCount(count)        { this.#initLandCount = count; }

    GetContinentSizeFactor()       { return this.#continentSizeFactor; }
    SetContinentSizeFactor(factor) { this.#continentSizeFactor = factor; }

    GetLandPercentage()            { return this.#landPercentage; }
    SetLandPercentage(value)       { this.#landPercentage = value; }

    GetEdgeDistFactorX()           { return this.#edgeDistFactorX; }
    SetEdgeDistFactorX(factor)     { this.#edgeDistFactorX = factor; }
    GetEdgeDistFactorY()           { return this.#edgeDistFactorY; }
    SetEdgeDistFactorY(factor)     { this.#edgeDistFactorY = factor; }
    
    GetEdgeDistFactorX_Initial()   { return this.#edgeDistFactorX_Initial; }
    GetEdgeDistFactorY_Initial()   { return this.#edgeDistFactorY_Initial; }
    
    GetStopGrowth()           { return this.#stopGrowth; }
    GetResumeGrowthLower()    { return this.#resumeGrowth_Lower; }
    GetResumeGrowthUpper()    { return this.#resumeGrowth_Upper; }
    GetGrowthColorStep()      { return this.#growthColorStep; }
}

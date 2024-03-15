import { GenerateVoronoiMap, GenerateNoiseMap, mapInfo, worldMap, ApplyTexture, rng, mapPlaneWireframe } from "./main";

const key_toggleWf          = 'w';
const key_showNoiseMap      = 'e';
const key_incSeed           = 'a';
const key_decSeed           = 's';
const key_incScale          = 'd';
const key_decScale          = 'f';
const key_incOctaves        = 'g';
const key_decOctaves        = 'h';
const key_incLacunarity     = 'j';
const key_decLacunarity     = 'k';
const key_incPersistance    = 'z';
const key_decPersistance    = 'x';
const key_incOffsetX        = 'c';
const key_incOffsetY        = 'v';
const key_decOffsetX        = 'b';
const key_decOffsetY        = 'n';

const value_Seed        = 1;
const value_Scale       = 5;
const value_Octaves     = 1;
const value_Lacunarity  = 0.05;
const value_Persistance = 0.05;
const value_OffsetX     = 1;
const value_OffsetY     = 1;

export default class UI {
    constructor() {
        this.m_controlsText
        this.m_mapText;
        
        this.m_showNoiseMap = false;

        this.CreateUI();
    }

    CreateUI() {
        this.m_controlsText = document.createElement('div');
        this.m_controlsText.style.position = 'absolute';
        this.m_controlsText.style.textAlign = 'center';
        this.m_controlsText.style.width = 100;
        this.m_controlsText.style.height = 100;
        this.m_controlsText.style.backgroundColor = 'rgb(42, 46, 50, 0.5)';
        this.m_controlsText.style.color = 'white';
        this.m_controlsText.innerHTML = 
            'Controls:<br>' +
            key_toggleWf + ': Toggle wireframe<br>' +
            key_showNoiseMap + ': Show noise map<br>' +
            key_incSeed + '/' + key_decSeed + ': +/- seed<br>' +
            key_incScale + '/' + key_decScale + ': +/- scale<br>' +
            key_incOctaves + '/' + key_decOctaves + ': +/- octaves<br>' +
            key_incLacunarity + '/' + key_decLacunarity + ': +/- lacunarity<br>' +
            key_incPersistance + '/' + key_decPersistance + ': +/- persistance<br>' +
            key_incOffsetX + '/' + key_decOffsetX + ': +/- offset x<br>' +
            key_incOffsetY + '/' + key_decOffsetY + ': +/- offset y<br>';
        this.m_controlsText.style.fontSize = 14 + 'pt';
        this.m_controlsText.style.fontFamily = 'monospace';
        this.m_controlsText.style.bottom = 10 + 'px';
        this.m_controlsText.style.left = 10 + 'px';
        document.body.appendChild(this.m_controlsText);

        this.m_mapText = document.createElement('div');
        this.m_mapText.style.position = 'absolute';
        this.m_mapText.style.textAlign = 'center';
        this.m_mapText.style.width = 100;
        this.m_mapText.style.height = 100;
        this.m_mapText.style.backgroundColor = 'rgb(42, 46, 50, 0.5)';
        this.m_mapText.style.color = 'white';
        this.m_mapText.innerHTML =
            'Resolution: '      + mapInfo.GetWidth() + "x" + mapInfo.GetHeight() +
            '<br>Grid count: '  + mapInfo.GetGridsX() + "x" + mapInfo.GetGridsY() +
            '<br>Seed: '        + Number((mapInfo.GetSeed()).toFixed(2)) +
            '<br>Scale: '       + Number((worldMap.GetScale()).toFixed(2)) +
            '<br>Octaves: '     + Number((worldMap.GetOctaves()).toFixed(2)) +
            '<br>Lacunarity: '  + Number((worldMap.GetLacunarity()).toFixed(2))+
            '<br>Persistance: ' + Number((worldMap.GetPersistance()).toFixed(2)) +
            '<br>Offset: ('     + Number((worldMap.GetOffset().x).toFixed(2)) + ', ' + Number((worldMap.GetOffset().y).toFixed(2)) + ')';
        this.m_mapText.style.fontSize = 14 + 'pt';
        this.m_mapText.style.fontFamily = 'monospace';
        this.m_mapText.style.top = 10 + 'px';
        this.m_mapText.style.left = 10 + 'px';
        document.body.appendChild(this.m_mapText);
        
        // this.AddButton("Seed");
        // this.AddButton("Scale");
        // this.AddButton("Octaves");
        // this.AddButton("Lacunarity");
        // this.AddButton("Persistance");
    }
    
    AddButton(text) {
        this.m_mapText = document.createElement('button');
        this.m_mapText.style.position = 'relative';
        this.m_mapText.style.width = 100;
        this.m_mapText.style.height = 100;
        this.m_mapText.style.backgroundColor = 'rgb(42, 46, 50, 1)';
        this.m_mapText.style.color = 'white';
        this.m_mapText.innerHTML = text;
        this.m_mapText.style.fontSize = 14 + 'pt';
        this.m_mapText.style.fontFamily = 'monospace';
        this.m_mapText.style.bottom = 50 + 'px';
        document.body.appendChild(this.m_mapText);
    }

    UpdateUI() {
        this.m_mapText.innerHTML =
            'Resolution: '      + mapInfo.GetWidth() + "x" + mapInfo.GetHeight() +
            '<br>Grid count: '      + mapInfo.GetGridsX() + "x" + mapInfo.GetGridsY() +
            '<br>Seed: '        + Number((mapInfo.GetSeed()).toFixed(2)) +
            '<br>Scale: '       + Number((worldMap.GetScale()).toFixed(2)) +
            '<br>Octaves: '     + Number((worldMap.GetOctaves()).toFixed(2)) +
            '<br>Lacunarity: '  + Number((worldMap.GetLacunarity()).toFixed(2))+
            '<br>Persistance: ' + Number((worldMap.GetPersistance()).toFixed(2)) +
            '<br>Offset: ('      + Number((worldMap.GetOffset().x).toFixed(2)) + ', ' + Number((worldMap.GetOffset().y).toFixed(2)) + ')';
    }

    OnInput(keyName) {
        switch (keyName) {
            case key_toggleWf: {
                mapPlaneWireframe.visible = !mapPlaneWireframe.visible;
                break;
            }

            case key_showNoiseMap: {
                this.m_showNoiseMap = !this.m_showNoiseMap;
                GenerateNoiseMap();
                ApplyTexture();
                break;
            }

            case key_incSeed: {
                mapInfo.ChangeSeed(value_Seed);
                this.UpdateUI();
                rng.SetRandNumGen(mapInfo.GetSeed());
                GenerateNoiseMap();
                GenerateVoronoiMap();
                
                ApplyTexture();

                break;
            }
            case key_decSeed: {
                mapInfo.ChangeSeed(-value_Seed);
                this.UpdateUI();
                rng.SetRandNumGen(mapInfo.GetSeed());
                GenerateNoiseMap();
                GenerateVoronoiMap();
                
                ApplyTexture();

                break;
            }

            case key_incScale: {
                worldMap.ChangeScale(value_Scale);
                this.UpdateUI();
                GenerateNoiseMap();
                GenerateVoronoiMap();
                
                ApplyTexture();

                break;
            }
            case key_decScale: {
                worldMap.ChangeScale(-value_Scale);
                this.UpdateUI();
                GenerateNoiseMap();
                GenerateVoronoiMap();
                
                ApplyTexture();

                break;
            }

            case key_incOctaves: {
                worldMap.ChangeOctaves(value_Octaves);
                this.UpdateUI();
                GenerateNoiseMap();
                GenerateVoronoiMap();
                
                ApplyTexture();

                break;
            }
            case key_decOctaves: {
                worldMap.ChangeOctaves(-value_Octaves);
                this.UpdateUI();
                GenerateNoiseMap();
                GenerateVoronoiMap();
                
                ApplyTexture();

                break;
            }

            case key_incLacunarity: {
                worldMap.ChangeLacunarity(value_Lacunarity);
                this.UpdateUI();
                GenerateNoiseMap();
                GenerateVoronoiMap();
                
                ApplyTexture();

                break;
            }
            case key_decLacunarity: {
                worldMap.ChangeLacunarity(-value_Lacunarity);
                this.UpdateUI();
                GenerateNoiseMap();
                GenerateVoronoiMap();
                
                ApplyTexture();

                break;
            }

            case key_incPersistance: {
                worldMap.ChangePersistance(value_Persistance);
                this.UpdateUI();
                GenerateNoiseMap();
                GenerateVoronoiMap();
                
                ApplyTexture();

                break;
            }
            case key_decPersistance: {
                worldMap.ChangePersistance(-value_Persistance);
                this.UpdateUI();
                GenerateNoiseMap();
                GenerateVoronoiMap();
                ApplyTexture();
                break;
            }
            
            case key_incOffsetX: {
                worldMap.ChangeOffsetX(value_OffsetX);
                this.UpdateUI();
                GenerateNoiseMap();
                GenerateVoronoiMap();
                ApplyTexture();
                break;
            }
            
            case key_decOffsetX: {
                worldMap.ChangeOffsetX(-value_OffsetX);
                this.UpdateUI();
                GenerateNoiseMap();
                GenerateVoronoiMap();
                ApplyTexture();
                break;
            }
            
            case key_incOffsetY: {
                worldMap.ChangeOffsetY(value_OffsetY);
                this.UpdateUI();
                GenerateNoiseMap();
                GenerateVoronoiMap();
                ApplyTexture();
                break;
            }
            
            case key_decOffsetY: {
                worldMap.ChangeOffsetY(-value_OffsetY);
                this.UpdateUI();
                GenerateNoiseMap();
                GenerateVoronoiMap();
                ApplyTexture();
                break;
            }
        }
    }

}

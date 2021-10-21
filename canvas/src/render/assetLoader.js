import * as PIXI from 'pixi.js'

import Creature1 from '../../assets/creature-1.svg';
import Creature2 from '../../assets/creature-2.svg';
import Creature4 from '../../assets/creature-4.svg';
import Creature5 from '../../assets/creature-5.svg';
import Creature6 from '../../assets/creature-6.svg';
import Creature7 from '../../assets/creature-7.svg';

import Tile1 from '../../assets/tile-1-color.png';
import Tile2 from '../../assets/tile-2-color.png';
import Tile3 from '../../assets/tile-3-color.png';
import Tile4 from '../../assets/tile-4-color.png';

import MossElement1 from '../../assets/moss-element-1.svg';
import MossElement2 from '../../assets/moss-element-2.svg';
import MossElement3 from '../../assets/moss-element-3.svg';
import MossElement4 from '../../assets/moss-element-4.svg';

import LichenElement1 from '../../assets/lichen-element-1.svg';
import LichenElement2 from '../../assets/lichen-element-2.svg';
import LichenElement3 from '../../assets/lichen-element-3.svg';
import LichenElement4 from '../../assets/lichen-element-4.svg';

import MushroomElement1 from '../../assets/mushroom-element-1.svg';
import MushroomElement2 from '../../assets/mushroom-element-2.svg';

import { DWC_META } from '../../../shared-constants';

const loader = PIXI.Loader.shared

const addCreatures = () => {
    loader.add(DWC_META.creatures.CREATURE_1, Creature1)
    loader.add(DWC_META.creatures.CREATURE_2, Creature2)
    loader.add(DWC_META.creatures.CREATURE_4, Creature4)
    loader.add(DWC_META.creatures.CREATURE_5, Creature5)
    loader.add(DWC_META.creatures.CREATURE_6, Creature6)
    loader.add(DWC_META.creatures.CREATURE_7, Creature7)    
}

const addBackgroundTiles = () => {
    loader.add(DWC_META.tiles.TILE_1, Tile1)
    loader.add(DWC_META.tiles.TILE_2, Tile2)
    loader.add(DWC_META.tiles.TILE_3, Tile3)
    loader.add(DWC_META.tiles.TILE_4, Tile4)
}

const addNewCreatures = () => {
    loader.add(DWC_META.creaturesNew.moss["moss-element-1"].name, MossElement1)
    loader.add(DWC_META.creaturesNew.moss["moss-element-2"].name, MossElement2)
    loader.add(DWC_META.creaturesNew.moss["moss-element-3"].name, MossElement3)
    loader.add(DWC_META.creaturesNew.moss["moss-element-4"].name, MossElement4)

    loader.add(DWC_META.creaturesNew.lichen["lichen-element-1"].name, LichenElement1)
    loader.add(DWC_META.creaturesNew.lichen["lichen-element-2"].name, LichenElement2)
    loader.add(DWC_META.creaturesNew.lichen["lichen-element-3"].name, LichenElement3)
    loader.add(DWC_META.creaturesNew.lichen["lichen-element-4"].name, LichenElement4)

    loader.add(DWC_META.creaturesNew.mushroom["mushroom-element-1"].name, MushroomElement1)
    loader.add(DWC_META.creaturesNew.mushroom["mushroom-element-2"].name, MushroomElement2)
}

export const loadAll = async (onProgress) => {
    addCreatures()
    addBackgroundTiles()
    addNewCreatures()

    return new Promise((res, rej) => {
        loader.load((loader, resources) => { res(resources) })
        loader.onProgress.add((t) => { onProgress(t) })
    })
}
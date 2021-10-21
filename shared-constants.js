exports.DWC_META = {
    creatures: {
        CREATURE_1: "creature-1",
        CREATURE_2: "creature-2",
        CREATURE_4: "creature-4",
        CREATURE_5: "creature-5",
        CREATURE_6: "creature-6",
        CREATURE_7: "creature-7",
    },
    creaturesNew: {
        moss: {
            "moss-element-1": {
                name: "moss-element-1",
                connectors: {
                    "moss-element-1": 5,
                    "moss-element-2": 3
                }
            },
            "moss-element-2": {
                name: "moss-element-2",
                connectors: {
                    "moss-element-1": 3,
                    "moss-element-2": 4
                }
            },
            "moss-element-3": {
                name: "moss-element-3",
                connectors: {
                    "moss-element-3": 4,
                    "moss-element-4": 3
                }
            },
            "moss-element-4": {
                name: "moss-element-4",
                connectors: {
                    "moss-element-3": 4,
                    "moss-element-4": 4
                }
            }
        }
    },
    creaturePropertyTypes: {
        position: 'position',
        shape: 'shape'
    },
    tiles: {
        TILE_1: "tile-1",
        TILE_2: "tile-2",
        TILE_3: "tile-3",
        TILE_4: "tile-4"
    }
}

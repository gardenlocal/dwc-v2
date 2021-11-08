const DWC_META = {
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
                anchor: { x: 0.5, y: 0 },
                connectors: {
                    "moss-element-1": 6,
                    "moss-element-2": 9
                }
            },
            "moss-element-2": {
                name: "moss-element-2",
                anchor: { x: 0, y: 0 },
                connectors: {
                    "moss-element-1": 6,
                    "moss-element-2": 6
                }
            }
        },
        mushroom: {
            "mushroom-element-1": {
                name: "mushroom-element-1",
                anchor: { x: 0, y: 0.5 },
                connectors: {}
            }
        }
    },
    creaturesOld: {
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
        },
        lichen: {
            "lichen-element-1": {
                name: "lichen-element-1",
                connectors: {
                    "lichen-element-1": 1,
                    "lichen-element-2": 1
                }
            },
            "lichen-element-2": {
                name: "lichen-element-2",
                connectors: {
                    "lichen-element-1": 1,
                    "lichen-element-2": 1
                }
            },
            "lichen-element-3": {
                name: "lichen-element-3",
                connectors: {
                    "lichen-element-3": 1,
                    "lichen-element-4": 1
                }
            },
            "lichen-element-4": {
                name: "lichen-element-4",
                connectors: {
                    "lichen-element-3": 1,
                    "lichen-element-4": 1
                }
            }
        },
        mushroom: {
            "mushroom-element-1": {
                name: "mushroom-element-1",
                connectors: {
                    "mushroom-element-1": 1,
                    "mushroom-element-2": 1
                }
            },
            "mushroom-element-2": {
                name: "mushroom-element-2",
                connectors: {
                    "mushroom-element-1": 1,
                    "mushroom-element-2": 1
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
    },
    tileShapes: {
        TRIANGLE: 'TRIANGLE',
        CIRCLE: 'CIRCLE'      
    }
}

exports.DWC_META = DWC_META

exports.generateMushroom = () => {
    const creatureType = 'mushroom'
    const noElementsForCreature = Object.keys(DWC_META.creaturesNew[creatureType]).length
    const svgElementIndex = randomIntInRange(0, noElementsForCreature)

    const mirrorSectionScale = randomInRange(0.3, 1)        

    const mainSectionChildren = getMushroomChildren(3, 8)
    const mirrorSectionChildren = getMushroomChildren(3, 8)

    const scale = randomInRange(1, 4)
    const rotation = randomInRange(-Math.PI / 2, Math.PI / 2)
    const fillColor = (Math.random() < 0.5) ? 0x0cef42 : 0xfd880b

    return {
        creatureType,
        svgElementIndex,
        mirrorSectionScale,        
        mainSectionChildren,
        mirrorSectionChildren,
        scale,
        rotation,
        fillColor
    }
}

exports.generateMoss = () => {
    const creatureType = 'moss'
    const noElementsForCreature = Object.keys(DWC_META.creaturesNew[creatureType]).length
    
    const svgElementIndex = randomIntInRange(0, noElementsForCreature)
    const firstElementType = Object.values(DWC_META.creaturesNew[creatureType])[svgElementIndex].name

    const childrenSequence = getMossChildrenSequence(creatureType, firstElementType, 13, 28)
    const fillColor = (Math.random() < 0.5) ? 0x0cef42 : 0xfd880b

    const scale = randomInRange(1, 3)
    const rotation = randomInRange(0, 0)

    return {
        creatureType,
        svgElementIndex,
        childrenSequence,
        scale,
        rotation,
        fillColor
    }    
}

const getMossChildrenSequence = (creatureType, elementType, minChildren, maxChildren) => {
    let noElements = randomIntInRange(minChildren, maxChildren)
    let elementsProps = []
    let typeKey, nextTypeKey

    nextTypeKey = elementType
    for (let i = 0; i < noElements; i++) {
        typeKey = nextTypeKey

        const nextConnector = getMossNextChildConnector(creatureType, typeKey)
        elementsProps.push(nextConnector)

        nextTypeKey = nextConnector.nextTypeKey
    }

    return elementsProps
}

const getMossNextChildConnector = (creatureType, elementType) => {
    let nextTypeKey = randomElementFromArray(Object.keys(DWC_META.creaturesNew[creatureType][elementType].connectors))
    if (Math.random() > 0.2) {
        while (nextTypeKey == elementType) {
            nextTypeKey = randomElementFromArray(Object.keys(DWC_META.creaturesNew[creatureType][elementType].connectors))
        }
    }
    return {
        typeKey: elementType,
        nextTypeKey: nextTypeKey,
        connectorIndex: randomIntInRange(0, DWC_META.creaturesNew[creatureType][elementType].connectors[nextTypeKey])
    }
}
exports.getMossNextChildConnector = getMossNextChildConnector

const getMushroomChildren = (minChildren, maxChildren) => {
    let noElements = randomIntInRange(minChildren, maxChildren)    
    let childrenDimensions = []
    let possibleSizes = [2, 3, 4, 5, 6, 8]

    let sum = 0
    for (let i = 0; i < noElements; i++) {
        let curr = randomElementFromArray(possibleSizes)
        childrenDimensions.push(curr)
        sum += curr
    }

    for (let i = 0; i < noElements; i++) {            
        childrenDimensions[i] /= sum
    }

    return childrenDimensions
}

exports.generateLichen = () => {
    return {

    }
}

function randomInRange(a, b) {
    return Math.random() * (b - a) + a
}

function randomIntInRange(a, b) { 
    return Math.floor(randomInRange(a, b))
}  

function randomElementFromArray(arr) {
    return arr[randomIntInRange(0, arr.length)]
}

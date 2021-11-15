const DWC_META = {
    creatures: {
        moss: "moss",
        mushroom: "mushroom",
        lichen: "lichen"
    },
    creaturesNew: {
        moss: {
            "moss-element-1": {
                name: "moss-element-1",
                anchor: { x: 0.5, y: 0 },
                connectors: {
                    "moss-element-2": 6
                }
            },
            "moss-element-2": {
                name: "moss-element-2",
                anchor: { x: 0, y: 0 },
                connectors: {
                    "moss-element-1": 6
                }
            }
        },
        mushroom: {
            "mushroom-element-1": {
                name: "mushroom-element-1",
                anchor: { x: 0, y: 0.5 },
                connectors: {}
            }
        },
        lichen: {
            "lichen-element-1": {
                name: "lichen-element-1",
                anchor: { x: 0.5, y: 0.5 },
                connectors: {
                    "lichen-element-1": 4
                }
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

exports.generateMoss = () => {
    const creatureType = 'moss'
    const noElementsForCreature = Object.keys(DWC_META.creaturesNew[creatureType]).length
    
    const svgElementIndex = randomIntInRange(0, noElementsForCreature)
    const firstElementType = Object.values(DWC_META.creaturesNew[creatureType])[svgElementIndex].name

    const childrenSequence = getMossChildrenSequence(creatureType, firstElementType, 50, 60)
    const fillColor = (Math.random() < 0.5) ? 0x0cef42 : 0xfd880b
    const noVisibleElements = randomIntInRange(6, 18)
    const evolutionIndex = noVisibleElements

    const scale = randomInRange(1, 3)
    const rotation = randomInRange(0, 0)

    return {
        creatureType,
        svgElementIndex,
        childrenSequence,
        scale,
        rotation,
        noVisibleElements,
        evolutionIndex,
        fillColor
    }    
}

const getMossChildrenSequence = (creatureType, elementType, minChildren, maxChildren) => {
    let noElements = randomIntInRange(minChildren, maxChildren)
    let elementsProps = []
    let typeKey, nextTypeKey
    let lastConnectorIndex = -4

    nextTypeKey = elementType
    for (let i = 0; i < noElements; i++) {
        typeKey = nextTypeKey

        const nextConnector = getMossNextChildConnector(creatureType, typeKey, lastConnectorIndex)
        elementsProps.push(nextConnector)

        nextTypeKey = nextConnector.nextTypeKey
        lastConnectorIndex = nextConnector.connectorIndex
    }

    return elementsProps
}

const getMossNextChildConnector = (creatureType, elementType, prevIndex = -4) => {
    let nextTypeKey = randomElementFromArray(Object.keys(DWC_META.creaturesNew[creatureType][elementType].connectors))
    let connectorIndex = randomIntInRange(0, DWC_META.creaturesNew[creatureType][elementType].connectors[nextTypeKey])
    // Make sure to add a connector that doesn't place a shape back onto the previous position
    // This relies on properly ordering layers inside of the svg
    while (Math.floor(connectorIndex / 2) == Math.floor(prevIndex / 2)) {
        connectorIndex = randomIntInRange(0, DWC_META.creaturesNew[creatureType][elementType].connectors[nextTypeKey])
    }
    return {
        typeKey: elementType,
        nextTypeKey: nextTypeKey,
        connectorIndex: connectorIndex
    }
}
exports.getMossNextChildConnector = getMossNextChildConnector

exports.generateMushroom = () => {
    const creatureType = 'mushroom'
    const noElementsForCreature = Object.keys(DWC_META.creaturesNew[creatureType]).length
    const svgElementIndex = randomIntInRange(0, noElementsForCreature)

    const noChildren = randomIntInRange(3, 8)

    const evolutions = []
    const noEvolutions = 6
    for (let i = 0; i < noEvolutions; i++) {
        evolutions.push({
            mainSectionChildren: getMushroomChildren(noChildren, noChildren + 1),
            mainSectionChildrenAnims: [getMushroomChildren(noChildren, noChildren + 1), getMushroomChildren(noChildren, noChildren + 1)],
            mirrorSectionScale: randomInRange(0.3, 0.6),
            mirrorSectionChildren: getMushroomChildren(3, 8),
            mirrorSectionParentIndex: randomIntInRange(0, noChildren)   
        })
    }

    const scale = randomInRange(1, 4)
    const rotation = randomInRange(-Math.PI / 2, Math.PI / 2)
    const fillColor = (Math.random() < 0.5) ? 0x0cef42 : 0xfd880b
    const evolutionIndex = 0

    return {
        creatureType,
        svgElementIndex,
        noChildren,
        evolutions,
        evolutionIndex,
        scale,
        rotation,
        fillColor
    }
}

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
    const creatureType = "lichen"
    const totalEvolutions = 35

    let noChildren = randomIntInRange(1, 4)
    let parentType = randomElementFromArray(Object.keys(DWC_META.creaturesNew[creatureType]))
    let element = {
        type: parentType,
        children: [],
        parentConnector: null,
        visibleChildren: noChildren,        
    }
    
    let parentUsedConnectors = {}

    for (let i = 0; i < totalEvolutions; i++) {        
        let childType = randomElementFromArray(Object.keys(DWC_META.creaturesNew[creatureType][parentType].connectors))
        let ch = {
            type: childType,
            children: [],
        }

        // Only keep track of the last "noChildren" used connectors
        if (i >= noChildren) {
            let connIndex = element.children[i - noChildren].parentConnector
            delete parentUsedConnectors[connIndex]
        }

        const connectorCount = DWC_META.creaturesNew[creatureType][childType].connectors[childType]
        ch.parentConnector = randomIntInRange(0, connectorCount)
        while (parentUsedConnectors[ch.parentConnector]) {
            ch.parentConnector = randomIntInRange(0, connectorCount)
        }
        parentUsedConnectors[ch.parentConnector] = true


        let no2Children = randomIntInRange(0, 3)
        let childUsedConnectors = {}

        for (let j = 0; j < no2Children; j++) {
            const child2Type = randomElementFromArray(Object.keys(DWC_META.creaturesNew[creatureType][childType].connectors))
            let c = {
                type: child2Type,
                children: []
            }            

            const connector2Count = DWC_META.creaturesNew[creatureType][childType].connectors[child2Type]
            c.type = child2Type
            c.parentConnector = randomIntInRange(0, connector2Count)
            while (childUsedConnectors[c.parentConnector]) {
                c.parentConnector = randomIntInRange(0, connector2Count)
            }
            childUsedConnectors[c.parentConnector] = true

            ch.children.push(c)            
        }

        element.children.push(ch)
    }

    const scale = randomInRange(1, 4)
    const rotation = randomInRange(-Math.PI / 2, Math.PI / 2)
    const fillColor = (Math.random() < 0.5) ? 0x0cef42 : 0xfd880b
    const evolutionIndex = noChildren

    return {
        creatureType,
        scale,
        rotation,
        fillColor,
        evolutionIndex,
        visibleChildren: noChildren,
        element
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
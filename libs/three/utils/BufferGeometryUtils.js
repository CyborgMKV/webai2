import {
    BufferAttribute,
    BufferGeometry,
    Float32BufferAttribute,
    InterleavedBuffer,
    InterleavedBufferAttribute,
    Matrix4,
    Mesh,
    Sphere,
    Vector2,
    Vector3,
    Vector4,
    TriangleStripDrawMode,
    TrianglesDrawMode,
    TriangleFanDrawMode
} from '../three.module.js'; // Adjust this path if necessary for your structure

const _vector = /*@__PURE__*/ new Vector3();
const _vector2 = /*@__PURE__*/ new Vector2();
const _vector3 = /*@__PURE__*/ new Vector3();
const _vector4 = /*@__PURE__*/ new Vector4();
const _matrix = /*@__PURE__*/ new Matrix4();

/**
 * @param  {BufferGeometry[]} geometries
 * @param  {boolean} useGroups
 * @return {BufferGeometry|null}
 */
function mergeGeometries( geometries, useGroups = false ) {

    const isIndexed = geometries[ 0 ].index !== null;

    const attributesUsed = new Set( Object.keys( geometries[ 0 ].attributes ) );
    const morphAttributesUsed = new Set( Object.keys( geometries[ 0 ].morphAttributes ) );

    const attributes = {};
    const morphAttributes = {};

    const morphTargetsRelative = geometries[ 0 ].morphTargetsRelative;

    const mergedGeometry = new BufferGeometry();

    let offset = 0;

    for ( let i = 0; i < geometries.length; ++ i ) {

        const geometry = geometries[ i ];
        let attributesCount = 0;

        // ensure that all geometries are indexed, or none

        if ( isIndexed !== ( geometry.index !== null ) ) {

            console.error( 'THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index ' + i + '. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.' );
            return null;

        }

        // gather attributes, exit early if they're different

        for ( const name in geometry.attributes ) {

            if ( ! attributesUsed.has( name ) ) {

                console.error( 'THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index ' + i + '. All geometries must have compatible attributes; make sure "' + name + '" attribute exists among all geometries, or in none of them.' );
                return null;

            }

            if ( attributes[ name ] === undefined ) attributes[ name ] = [];

            attributes[ name ].push( geometry.attributes[ name ] );
            attributesCount ++;

        }

        // ensure geometries have the same number of attributes

        if ( attributesCount !== attributesUsed.size ) {

            console.error( 'THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index ' + i + '. Make sure all geometries have the same number of attributes.' );
            return null;

        }

        // gather morph attributes, exit early if they're different

        if ( morphTargetsRelative !== geometry.morphTargetsRelative ) {

            console.error( 'THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index ' + i + '. .morphTargetsRelative must be consistent throughout all geometries.' );
            return null;

        }

        for ( const name in geometry.morphAttributes ) {

            if ( ! morphAttributesUsed.has( name ) ) {

                console.error( 'THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index ' + i + '.  .morphAttributes must be consistent throughout all geometries.' );
                return null;

            }

            if ( morphAttributes[ name ] === undefined ) morphAttributes[ name ] = [];

            morphAttributes[ name ].push( geometry.morphAttributes[ name ] );

        }

        // gather .userData

        mergedGeometry.userData.mergedUserData = mergedGeometry.userData.mergedUserData || [];
        mergedGeometry.userData.mergedUserData.push( geometry.userData );

        if ( useGroups ) {

            let count;

            if ( isIndexed ) {

                count = geometry.index.count;

            } else if ( geometry.attributes.position !== undefined ) {

                count = geometry.attributes.position.count;

            } else {

                console.error( 'THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index ' + i + '. The geometry must have either an index or a position attribute' );
                return null;

            }

            mergedGeometry.addGroup( offset, count, i );

            offset += count;

        }

    }

    // merge indices

    if ( isIndexed ) {

        let indexOffset = 0;
        const mergedIndex = [];

        for ( let i = 0; i < geometries.length; ++ i ) {

            const index = geometries[ i ].index;

            for ( let j = 0; j < index.count; ++ j ) {

                mergedIndex.push( index.getX( j ) + indexOffset );

            }

            indexOffset += geometries[ i ].attributes.position.count;

        }

        mergedGeometry.setIndex( mergedIndex );

    }

    // merge attributes

    for ( const name in attributes ) {

        const mergedAttribute = mergeAttributes( attributes[ name ] );

        if ( ! mergedAttribute ) {

            // If this error happens, we report already above in the attributesUsed section.
            return null;

        }

        mergedGeometry.setAttribute( name, mergedAttribute );

    }

    // merge morph attributes

    for ( const name in morphAttributes ) {

        const numMorphTargets = morphAttributes[ name ][ 0 ].length;

        if ( numMorphTargets === 0 ) break;

        mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
        mergedGeometry.morphAttributes[ name ] = [];

        for ( let i = 0; i < numMorphTargets; ++ i ) {

            const morphAttributesToMerge = [];

            for ( let j = 0; j < morphAttributes[ name ].length; ++ j ) {

                morphAttributesToMerge.push( morphAttributes[ name ][ j ][ i ] );

            }

            const mergedMorphAttribute = mergeAttributes( morphAttributesToMerge );

            if ( ! mergedMorphAttribute ) {

                console.error( 'THREE.BufferGeometryUtils: .mergeGeometries() failed while merging morph target attributes. Ensure all attributes are compatible.' );
                return null;

            }

            mergedGeometry.morphAttributes[ name ].push( mergedMorphAttribute );

        }

    }

    return mergedGeometry;

}

/**
 * @param {Array<BufferAttribute>} attributes
 * @return {BufferAttribute|null}
 */
function mergeAttributes( attributes ) {

    let TypedArray;
    let itemSize;
    let normalized;
    let arrayLength = 0;

    for ( let i = 0; i < attributes.length; ++ i ) {

        const attribute = attributes[ i ];

        if ( attribute.isInterleavedBufferAttribute ) {

            console.error( 'THREE.BufferGeometryUtils: .mergeAttributes() failed. InterleavedBufferAttributes are not supported.' );
            return null;

        }

        if ( TypedArray === undefined ) TypedArray = attribute.array.constructor;
        if ( TypedArray !== attribute.array.constructor ) {

            console.error( 'THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.' );
            return null;

        }

        if ( itemSize === undefined ) itemSize = attribute.itemSize;
        if ( itemSize !== attribute.itemSize ) {

            console.error( 'THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.' );
            return null;

        }

        if ( normalized === undefined ) normalized = attribute.normalized;
        if ( normalized !== attribute.normalized ) {

            console.error( 'THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.' );
            return null;

        }

        arrayLength += attribute.array.length;

    }

    const array = new TypedArray( arrayLength );
    let offset = 0;

    for ( let i = 0; i < attributes.length; ++ i ) {

        array.set( attributes[ i ].array, offset );

        offset += attributes[ i ].array.length;

    }

    return new BufferAttribute( array, itemSize, normalized );

}

/**
 * @param {Array<BufferAttribute>} attributes
 * @return {Array<InterleavedBufferAttribute>}
 */
function interleaveAttributes( attributes ) {

    // Interleaves the provided attributes into an InterleavedBuffer and returns
    // a set of InterleavedBufferAttributes for each attribute
    let TypedArray;
    let arrayLength = 0;
    let itemSize = 0;

    // calculate the length and type of the interleavedBuffer
    for ( let i = 0, l = attributes.length; i < l; ++ i ) {

        const attribute = attributes[ i ];

        if ( TypedArray === undefined ) TypedArray = attribute.array.constructor;
        if ( TypedArray !== attribute.array.constructor ) {

            console.error( 'AttributeBuffers of different types cannot be interleaved' );
            return null;

        }

        arrayLength += attribute.array.length;
        itemSize += attribute.itemSize;

    }

    // Create the set of buffer attributes
    const interleavedBuffer = new InterleavedBuffer( new TypedArray( arrayLength ), itemSize );
    let offset = 0;
    const res = [];
    const getters = [ 'getX', 'getY', 'getZ', 'getW' ];
    const setters = [ 'setX', 'setY', 'setZ', 'setW' ];

    for ( let j = 0, l = attributes.length; j < l; j ++ ) {

        const attribute = attributes[ j ];
        const itemSize = attribute.itemSize;
        const count = attribute.count;
        const iba = new InterleavedBufferAttribute( interleavedBuffer, itemSize, offset, attribute.normalized );
        res.push( iba );

        offset += itemSize;

        // Move the data for each attribute into the new interleavedBuffer
        // at the appropriate offset
        for ( let c = 0; c < count; c ++ ) {

            for ( let k = 0; k < itemSize; k ++ ) {

                iba[ setters[ k ] ]( c, attribute[ getters[ k ] ]( c ) );

            }

        }

    }

    return res;

}

/**
 * @param {Array<BufferGeometry>} geometry
 * @return {number}
 */
function estimateBytesUsed( geometry ) {

    // Return the estimated memory used by this geometry in bytes
    // Calculate using itemSize, count, and BYTES_PER_ELEMENT to account
    // for InterleavedBufferAttributes.
    let mem = 0;
    for ( const name in geometry.attributes ) {

        const attr = geometry.getAttribute( name );
        mem += attr.count * attr.itemSize * attr.array.BYTES_PER_ELEMENT;

    }

    const indices = geometry.getIndex();
    mem += indices ? indices.count * indices.itemSize * indices.array.BYTES_PER_ELEMENT : 0;
    return mem;

}

/**
 * @param {BufferGeometry} geometry
 * @param {number} tolerance
 * @return {BufferGeometry}
 */
function mergeVertices( geometry, tolerance = 1e-4 ) {

    tolerance = Math.max( tolerance, Number.EPSILON );

    // Generate an index buffer if the geometry doesn't have one, or optimize it
    // if it's already available.
    const hashToIndex = {};
    const indices = geometry.getIndex();
    const positions = geometry.getAttribute( 'position' );
    const vertexCount = indices ? indices.count : positions.count;

    // next value for triangle indices
    let nextIndex = 0;

    // attributes and new attribute arrays
    const attributeNames = Object.keys( geometry.attributes );
    const tmpAttributes = {};
    const tmpMorphAttributes = {};
    const newIndices = [];
    const getters = [ 'getX', 'getY', 'getZ', 'getW' ];
    const setters = [ 'setX', 'setY', 'setZ', 'setW' ];

    // Initialize the arrays, allocating space conservatively
    for ( let i = 0, l = attributeNames.length; i < l; i ++ ) {

        const name = attributeNames[ i ];
        const attr = geometry.attributes[ name ];
        tmpAttributes[ name ] = new BufferAttribute(
            new attr.array.constructor( attr.count * attr.itemSize ),
            attr.itemSize,
            attr.normalized
        );

        const morphAttr = geometry.morphAttributes[ name ];
        if ( morphAttr ) {

            tmpMorphAttributes[ name ] = new BufferAttribute(
                new morphAttr.array.constructor( morphAttr.count * morphAttr.itemSize ),
                morphAttr.itemSize,
                morphAttr.normalized
            );

        }

    }

    // convert the error tolerance to an amount of decimal places to truncate to
    const decimalShift = Math.log10( 1 / tolerance );
    const shiftMultiplier = Math.pow( 10, decimalShift );
    for ( let i = 0; i < vertexCount; i ++ ) {

        const index = indices ? indices.getX( i ) : i;

        // Generate a hash for the vertex attributes at the current index 'i'
        let hash = '';
        for ( let j = 0, l = attributeNames.length; j < l; j ++ ) {

            const name = attributeNames[ j ];
            const attribute = geometry.getAttribute( name );
            const itemSize = attribute.itemSize;

            for ( let k = 0; k < itemSize; k ++ ) {

                // double tilde truncates the decimal value
                hash += `${ ~ ~ ( attribute[ getters[ k ] ]( index ) * shiftMultiplier ) },`;

            }

        }

        // Add different attributes to the hash.
        if ( geometry.morphAttributes.position ) {

            const morphPositions = geometry.morphAttributes.position;
            const morphItemSize = morphPositions.itemSize;

            for ( let j = 0, l = morphPositions.length; j < l; j ++ ) {

                const morphPosition = morphPositions[ j ];
                for ( let k = 0; k < morphItemSize; k ++ ) {

                    hash += `${ ~ ~ ( morphPosition[ getters[ k ] ]( index ) * shiftMultiplier ) },`;

                }

            }

        }


        // Add another reference to the vertex if it's already
        // used by another index
        if ( hash in hashToIndex ) {

            newIndices.push( hashToIndex[ hash ] );

        } else {

            // copy data to the new index in the temporary attributes
            for ( let j = 0, l = attributeNames.length; j < l; j ++ ) {

                const name = attributeNames[ j ];
                const attribute = geometry.getAttribute( name );
                const tmpAttribute = tmpAttributes[ name ];
                const itemSize = attribute.itemSize;
                const morphAttribute = geometry.morphAttributes[ name ];
                const tmpMorphAttribute = tmpMorphAttributes[ name ];

                for ( let k = 0; k < itemSize; k ++ ) {

                    tmpAttribute[ setters[ k ] ]( nextIndex, attribute[ getters[ k ] ]( index ) );
                    if ( morphAttribute ) {

                        tmpMorphAttribute[ setters[ k ] ]( nextIndex, morphAttribute[ getters[ k ] ]( index ) );

                    }

                }

            }

            hashToIndex[ hash ] = nextIndex;
            newIndices.push( nextIndex );
            nextIndex ++;

        }

    }

    // Generate typed arrays from new attribute arrays and update
    // the attributeBuffers
    const result = geometry.clone();
    for ( let i = 0, l = attributeNames.length; i < l; i ++ ) {

        const name = attributeNames[ i ];
        const attribute = geometry.getAttribute( name );
        const normal = attribute.normalized;

        const newArray = tmpAttributes[ name ].array.slice( 0, nextIndex * attribute.itemSize );
        result.setAttribute( name, new BufferAttribute( newArray, attribute.itemSize, normal ) );

        if ( name in tmpMorphAttributes ) {

            const morphAttribute = geometry.morphAttributes[ name ];
            const newMorphArray = tmpMorphAttributes[ name ].array.slice( 0, nextIndex * morphAttribute.itemSize );
            result.morphAttributes[ name ] = ( new BufferAttribute( newMorphArray, morphAttribute.itemSize, morphAttribute.normalized ) );

        }

    }

    result.setIndex( newIndices );

    return result;

}

/**
 * @param {BufferGeometry} geometry
 * @param {number} drawMode
 * @return {BufferGeometry}
 */
function toTrianglesDrawMode( geometry, drawMode ) {

    if ( drawMode === TrianglesDrawMode ) {

        console.warn( 'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.' );
        return geometry;

    }

    if ( drawMode === TriangleFanDrawMode || drawMode === TriangleStripDrawMode ) {

        let index = geometry.getIndex();

        // generate index if not present

        if ( index === null ) {

            const indices = [];
            const position = geometry.getAttribute( 'position' );

            if ( position === undefined ) {

                console.error( 'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.' );
                return geometry;

            }

            for ( let i = 0; i < position.count; i ++ ) {

                indices.push( i );

            }

            geometry.setIndex( indices );
            index = geometry.getIndex();

        }

        //

        const numberOfTriangles = index.count - 2;
        const newIndices = [];

        if ( drawMode === TriangleFanDrawMode ) {

            // gl.TRIANGLE_FAN

            for ( let i = 1; i <= numberOfTriangles; i ++ ) {

                newIndices.push( index.getX( 0 ) );
                newIndices.push( index.getX( i ) );
                newIndices.push( index.getX( i + 1 ) );

            }

        } else {

            // gl.TRIANGLE_STRIP

            for ( let i = 0; i < numberOfTriangles; i ++ ) {

                if ( i % 2 === 0 ) {

                    newIndices.push( index.getX( i ) );
                    newIndices.push( index.getX( i + 1 ) );
                    newIndices.push( index.getX( i + 2 ) );

                } else {

                    newIndices.push( index.getX( i + 2 ) );
                    newIndices.push( index.getX( i + 1 ) );
                    newIndices.push( index.getX( i ) );

                }

            }

        }

        if ( ( newIndices.length / 3 ) !== numberOfTriangles ) {

            console.error( 'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.' );

        }

        // build final geometry

        const newGeometry = geometry.clone();
        newGeometry.setIndex( newIndices );
        newGeometry.clearGroups();

        return newGeometry;

    } else {

        console.error( 'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:', drawMode );
        return geometry;

    }

}

/**
 * Calculates the morphed attributes of a morphed/skinned BufferGeometry.
 * Helpful for Raytracing or Decals.
 * @param {Mesh | Line | Points} object An instance of Mesh, Line or Points.
 * @return {Object} An Object with original position/normal attributes and morphed ones.
 */
function computeMorphedAttributes( object ) {

    const _morphBaseInfluence = ( i, t ) => t;

    if ( object.geometry.isBufferGeometry !== true ) {

        console.error( 'THREE.BufferGeometryUtils: Geometry is not of type BufferGeometry.' );
        return null;

    }

    const manager = object.morphTargetInfluences !== undefined ? object.morphTargetManager() : null;

    const positionAttribute = object.geometry.attributes.position;
    const normalAttribute = object.geometry.attributes.normal;
    const morphPosition = manager !== null ? manager.getInfluencesByAttributeName( 'position' ) : null;
    const morphNormal = manager !== null ? manager.getInfluencesByAttributeName( 'normal' ) : null;

    // if the geometry is not morphed, simply return the buffer attributes
    if ( morphPosition === null && morphNormal === null ) {

        return {
            positionAttribute: positionAttribute,
            normalAttribute: normalAttribute,
        };

    }

    // store the original data on demand
    const morphedPositionAttribute = positionAttribute.clone();
    const morphedNormalAttribute = normalAttribute !== undefined ? normalAttribute.clone() : undefined;

    if ( morphPosition !== null ) {

        for ( let i = 0; i < morphPosition.length; i ++ ) {

            const { attribute, index, influence } = morphPosition[ i ];
            object.geometry.attributes[ attribute.name ].applyMorphTarget( index, morphedPositionAttribute, _morphBaseInfluence, influence );

        }

    }

    if ( morphNormal !== null ) {

        for ( let i = 0; i < morphNormal.length; i ++ ) {

            const { attribute, index, influence } = morphNormal[ i ];
            object.geometry.attributes[ attribute.name ].applyMorphTarget( index, morphedNormalAttribute, _morphBaseInfluence, influence );

        }

    }

    const result = {
        positionAttribute: morphedPositionAttribute,
        normalAttribute: morphedNormalAttribute
    };

    if ( manager !== null ) {

        manager.dispose();

    }

    return result;

}

function computeTangents( geometry ) {

    geometry.computeTangents();
    console.warn( 'THREE.BufferGeometryUtils: computeTangents() has been moved to BufferGeometry.computeTangents().' );

}

// Related discussion: https://github.com/mrdoob/three.js/pull/22931#issuecomment-1008301000
function deinterleaveAttribute( attribute ) {

    const cons = attribute.data.array.constructor;
    const count = attribute.count;
    const itemSize = attribute.itemSize;
    const normalized = attribute.normalized;

    const array = new cons( count * itemSize );

    let newAttribute;

    if ( attribute.isInterleavedBufferAttribute ) {

        newAttribute = new BufferAttribute( array, itemSize, normalized );

        for ( let i = 0; i < count; i ++ ) {

            newAttribute.setX( i, attribute.getX( i ) );

            if ( itemSize >= 2 ) {

                newAttribute.setY( i, attribute.getY( i ) );

            }

            if ( itemSize >= 3 ) {

                newAttribute.setZ( i, attribute.getZ( i ) );

            }

            if ( itemSize >= 4 ) {

                newAttribute.setW( i, attribute.getW( i ) );

            }

        }

    } else {

        newAttribute = attribute.clone();

    }

    return newAttribute;

}

// Related discussion: https://github.com/mrdoob/three.js/pull/22931#issuecomment-1008301000
function deinterleaveGeometry( geometry ) {

    const attributes = geometry.attributes;
    const newAttributes = {};

    for ( const key in attributes ) {

        newAttributes[ key ] = deinterleaveAttribute( attributes[ key ] );

    }

    return new BufferGeometry().setIndex( geometry.index ).setAttributes( newAttributes );

}

/**
 * @param {BufferGeometry} geometry
 * @param {boolean} splitDrawcalls
 * @returns {Mesh}
 *
 * Creates a new, non-indexed geometry with duplicated vertices for flat shading.
 *
 * When product of vertex count and attributes is too large, splitting of draw calls is enabled.
 * This is the same behavior as in VertexNormalsHelper.
 *
 * @TODO: This function is kind of specific to the VertexNormalsHelper and should be removed.
 */
function toCreasedNormals( geometry, splitDrawcalls = true ) {

    if ( geometry.index !== null ) {

        geometry = geometry.toNonIndexed();

    }

    const MAX_VERTICES_PER_DRAW_CALL = 21845; // 65535 / 3

    const numVertices = geometry.attributes.position.count;
    const numAttributes = Object.keys( geometry.attributes ).length;

    if ( splitDrawcalls === true && numVertices * numAttributes > MAX_VERTICES_PER_DRAW_CALL * 3 ) {

        const groupCount = Math.ceil( numVertices / MAX_VERTICES_PER_DRAW_CALL );

        const geometry2 = new BufferGeometry();
        geometry2.copy( geometry ); // deep copy (attributes, groups, bounding attributes)

        const newMesh = new Mesh( geometry2 ); // create a new mesh otherwise the original geometry will be altered by the split

        newMesh.geometry.clearGroups();

        for ( let i = 0, offset = 0; i < groupCount; i ++ ) {

            const count = Math.min( numVertices - offset, MAX_VERTICES_PER_DRAW_CALL );

            newMesh.geometry.addGroup( offset * 3, count * 3, 0 );

            offset += count;

        }

        return newMesh;

    } else {

        return new Mesh( geometry );

    }

}

/**
 * @param {BufferGeometry} geometry
 * @param {number} [precisionPoints=4]
 * @returns {string}
 *
 * Returns a new string with rounded floating-point values as components.
 */
function geometryToPrecision( geometry, precisionPoints = 4 ) {

    const newGeometry = geometry.clone();

    const attributes = newGeometry.attributes;

    for ( const key in attributes ) {

        const attribute = attributes[ key ];

        if ( attribute.isBufferAttribute === true && attribute.array.constructor === Float32Array ) {

            const array = attribute.array;

            for ( let i = 0; i < array.length; i ++ ) {

                array[ i ] = parseFloat( array[ i ].toFixed( precisionPoints ) );

            }

        }

    }

    return newGeometry;

}

/**
 * @param {BufferGeometry} geometry
 * @param {number} [precisionPoints=4]
 * @returns {string}
 *
 * Returns a new string with rounded floating-point values as components.
 * The original geometry is not modified.
 */
function geometryToHash( geometry, precisionPoints = 4 ) {

    let hash = '';

    const attributes = geometry.attributes;

    for ( const key in attributes ) {

        const attribute = attributes[ key ];

        if ( attribute.isBufferAttribute === true ) {

            const array = attribute.array;

            for ( let i = 0; i < array.length; i ++ ) {

                hash += `${ array[ i ].toFixed( precisionPoints ) },`;

            }

        }

    }

    return hash;

}

/**
 * @param {BufferGeometry} geometry
 * @param {number} [detail=1]
 * @returns {BufferGeometry}
 *
 * Modifies the supplied geometry if it is non-indexed, otherwise creates a new,
 * non-indexed geometry. Returns the geometry with an index attribute.
 * The index attribute is created by grouping vertices with the same position.
 * Used by SubdivisionModifier.
 *
 * @TODO This function should be moved to SubdivisionModifier.
 */
function mergeGroups( geometry, detail = 1 ) {

    if ( geometry.index !== null ) {

        console.warn( 'THREE.BufferGeometryUtils.mergeGroups(): The given geometry is already indexed. Index attribute will be overwritten.' );
        geometry = geometry.toNonIndexed();

    }

    const vertices = [];
    const positionAttribute = geometry.getAttribute( 'position' );

    for ( let i = 0; i < positionAttribute.count; i += 3 ) {

        const a = positionAttribute.getY( i );
        const b = positionAttribute.getY( i + 1 );
        const c = positionAttribute.getY( i + 2 );

        if ( vertices[ a ] === undefined ) {

            vertices[ a ] = {
                x: positionAttribute.getX( i ),
                y: positionAttribute.getY( i ),
                z: positionAttribute.getZ( i ),
                indices: []
            };

        }

        if ( vertices[ b ] === undefined ) {

            vertices[ b ] = {
                x: positionAttribute.getX( i + 1 ),
                y: positionAttribute.getY( i + 1 ),
                z: positionAttribute.getZ( i + 1 ),
                indices: []
            };

        }

        if ( vertices[ c ] === undefined ) {

            vertices[ c ] = {
                x: positionAttribute.getX( i + 2 ),
                y: positionAttribute.getY( i + 2 ),
                z: positionAttribute.getZ( i + 2 ),
                indices: []
            };

        }

        vertices[ a ].indices.push( i );
        vertices[ b ].indices.push( i + 1 );
        vertices[ c ].indices.push( i + 2 );

    }

    const newPositionAttribute = new Float32BufferAttribute( vertices.length * 3, 3 );
    const newIndex = [];

    for ( let i = 0; i < vertices.length; i ++ ) {

        const vertex = vertices[ i ];

        newPositionAttribute.setXYZ( i, vertex.x, vertex.y, vertex.z );

        for ( let j = 0; j < vertex.indices.length; j ++ ) {

            newIndex[ vertex.indices[ j ] ] = i;

        }

    }

    geometry.setAttribute( 'position', newPositionAttribute );
    geometry.setIndex( newIndex );

    //

    const morphAttributes = geometry.morphAttributes;

    for ( const key in morphAttributes ) {

        const morphAttribute = morphAttributes[ key ];
        const newMorphAttribute = new Float32BufferAttribute( vertices.length * 3, morphAttribute.itemSize );

        for ( let i = 0; i < vertices.length; i ++ ) {

            const vertex = vertices[ i ];

            for ( let j = 0; j < vertex.indices.length; j ++ ) {

                const index = vertex.indices[ j ];

                if ( morphAttribute.itemSize === 1 ) {

                    newMorphAttribute.setX( i, morphAttribute.getX( index ) );

                } else if ( morphAttribute.itemSize === 2 ) {

                    newMorphAttribute.setXY( i, morphAttribute.getX( index ), morphAttribute.getY( index ) );

                } else if ( morphAttribute.itemSize === 3 ) {

                    newMorphAttribute.setXYZ( i, morphAttribute.getX( index ), morphAttribute.getY( index ), morphAttribute.getZ( index ) );

                } else if ( morphAttribute.itemSize === 4 ) {

                    newMorphAttribute.setXYZW( i, morphAttribute.getX( index ), morphAttribute.getY( index ), morphAttribute.getZ( index ), morphAttribute.getW( index ) );

                }

            }

        }

        morphAttributes[ key ] = newMorphAttribute;

    }

    return geometry;

}

export {
    computeMorphedAttributes,
    computeTangents,
    deinterleaveAttribute,
    deinterleaveGeometry,
    estimateBytesUsed,
    interleaveAttributes,
    mergeAttributes,
    mergeGeometries,
    mergeGroups,
    mergeVertices,
    toCreasedNormals,
    toTrianglesDrawMode,
    geometryToPrecision,
    geometryToHash
};
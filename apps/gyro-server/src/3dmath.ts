/**
 * MIT License
 * 
 * Copyright (c) 2023 Donald F Reynolds
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
// Based on the work of Donald F Reyonolds (AxisAngles): https://github.com/AxisAngles/KotlinMath3D

export enum EulerOrder { XYZ, YZX, ZXY, ZYX, YXZ, XZY }

export class Vector3 {

    static NULL = new Vector3(0, 0, 0)
    static POS_X = new Vector3(1, 0, 0)
    static POS_Y = new Vector3(0, 1, 0)
    static POS_Z = new Vector3(0, 0, 1)
    static NEG_X = new Vector3(-1, 0, 0)
    static NEG_Y = new Vector3(0, -1, 0)
    static NEG_Z = new Vector3(0, 0, -1)

    x;
    y;
    z;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    get component1() {
        return this.x
    }
    get component2() {
        return this.y
    }
    get component3() {
        return this.z
    }

    unaryMinus() {
        return new Vector3(-this.x, -this.y, -this.z)
    }

    plus(that: Vector3) {
        return new Vector3(
            this.x + that.x,
            this.y + that.y,
            this.z + that.z,
        )
    }

    minus(that: Vector3) {
        return new Vector3(
            this.x - that.x,
            this.y - that.y,
            this.z - that.z,
        )
    }

    /**
     * computes the dot product of this vector with that vector
     * @param that the vector with which to be dotted
     * @return the dot product
     **/
    dot(that: Vector3) {
        return this.x * that.x + this.y * that.y + this.z * that.z
    }

    /**
     * computes the cross product of this vector with that vector
     * @param that the vector with which to be crossed
     * @return the cross product
     **/
    cross(that: Vector3) {
        return new Vector3(
            this.y * that.z - this.z * that.y,
            this.z * that.x - this.x * that.z,
            this.x * that.y - this.y * that.x,
        )
    }

    hadamard(that: Vector3) {
        return new Vector3(
            this.x * that.x,
            this.y * that.y,
            this.z * that.z,
        )
    }

    /**
     * computes the square of the length of this vector
     * @return the length squared
     **/
    lenSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z
    }

    /**
     * computes the length of this vector
     * @return the length
     **/
    len() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }

    /**
     * @return the normalized vector
     **/
    unit(): Vector3 | null {
        const m = this.len()
        if (m == 0)
            return null
        else
            return this.div(m)
    }

    times(that: number) {
        return new Vector3(
            this.x * that,
            this.y * that,
            this.z * that,
        )
    }

    // computes division of this vector3 by a float
    div(that: number) {
        return new Vector3(
            this.x / that,
            this.y / that,
            this.z / that,
        )
    }

    /**
     * computes the angle between this vector with that vector
     * @param that the vector to which the angle is computed
     * @return the angle
     **/
    angleTo(that: Vector3) {
        return Math.atan2(this.cross(that).len(), this.dot(that))
    }

    toString() {
        return `[${this.x},${this.y},${this.z}]`
    }
}


export class Matrix3 {

    static NULL = new Matrix3(
        0, 0, 0,
        0, 0, 0,
        0, 0, 0
    )
    static IDENTITY = new Matrix3(
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    )

    xx: number;
    yx: number;
    zx: number;
    xy: number;
    yy: number;
    zy: number;
    xz: number;
    yz: number;
    zz: number;

    constructor(
        xx: number, yx: number, zx: number,
        xy: number, yy: number, zy: number,
        xz: number, yz: number, zz: number
    ) {
        this.xx = xx;
        this.yx = yx;
        this.zx = zx;
        this.xy = xy;
        this.yy = yy;
        this.zy = zy;
        this.xz = xz;
        this.yz = yz;
        this.zz = zz;
    }

    // column getters
    get x() {
        return new Vector3(this.xx, this.xy, this.xz)
    }
    get y() {
        return new Vector3(this.yx, this.yy, this.yz)
    }
    get z() {
        return new Vector3(this.zx, this.zy, this.zz)
    }

    // row getters
    get xRow() {
        return new Vector3(this.xx, this.yx, this.zx)
    }
    get yRow() {
        return new Vector3(this.xy, this.yy, this.zy)
    }
    get zRow() {
        return new Vector3(this.xz, this.yz, this.zz)
    }

    component1() {
        return this.xx
    }
    component2() {
        return this.yx
    }
    component3() {
        return this.zx
    }
    component4() {
        return this.xy
    }
    component5() {
        return this.yy
    }
    component6() {
        return this.zy
    }
    component7() {
        return this.xz
    }
    component8() {
        return this.yz
    }
    component9() {
        return this.zz
    }

    unaryMinus() {
        return new Matrix3(
            -this.xx, -this.yx, -this.zx,
            -this.xy, -this.yy, -this.zy,
            -this.xz, -this.yz, -this.zz
        )
    }

    plus(that: Matrix3) {
        return new Matrix3(
            this.xx + that.xx, this.yx + that.yx, this.zx + that.zx,
            this.xy + that.xy, this.yy + that.yy, this.zy + that.zy,
            this.xz + that.xz, this.yz + that.yz, this.zz + that.zz
        )
    }

    minus(that: Matrix3) {
        return new Matrix3(
            this.xx - that.xx, this.yx - that.yx, this.zx - that.zx,
            this.xy - that.xy, this.yy - that.yy, this.zy - that.zy,
            this.xz - that.xz, this.yz - that.yz, this.zz - that.zz
        )
    }

    times(that: number) {
        return new Matrix3(
            this.xx * that, this.yx * that, this.zx * that,
            this.xy * that, this.yy * that, this.zy * that,
            this.xz * that, this.yz * that, this.zz * that
        )
    }

    timesVector(that: Vector3) {
        return new Vector3(
            this.xx * that.x + this.yx * that.y + this.zx * that.z,
            this.xy * that.x + this.yy * that.y + this.zy * that.z,
            this.xz * that.x + this.yz * that.y + this.zz * that.z
        )
    }

    timesMatrix(that: Matrix3) {
        return new Matrix3(
            this.xx * that.xx + this.yx * that.xy + this.zx * that.xz,
            this.xx * that.yx + this.yx * that.yy + this.zx * that.yz,
            this.xx * that.zx + this.yx * that.zy + this.zx * that.zz,
            this.xy * that.xx + this.yy * that.xy + this.zy * that.xz,
            this.xy * that.yx + this.yy * that.yy + this.zy * that.yz,
            this.xy * that.zx + this.yy * that.zy + this.zy * that.zz,
            this.xz * that.xx + this.yz * that.xy + this.zz * that.xz,
            this.xz * that.yx + this.yz * that.yy + this.zz * that.yz,
            this.xz * that.zx + this.yz * that.zy + this.zz * that.zz
        )
    }

    /**
     * computes the square of the frobenius norm of this matrix
     * @return the frobenius norm squared
     */
    normSq() {
        return this.xx * this.xx + this.yx * this.yx + this.zx * this.zx +
            this.xy * this.xy + this.yy * this.yy + this.zy * this.zy +
            this.xz * this.xz + this.yz * this.yz + this.zz * this.zz
    }

    /**
     * computes the frobenius norm of this matrix
     * @return the frobenius norm
     */
    norm() {
        return Math.sqrt(this.normSq())
    }

    /**
     * computes the determinant of this matrix
     * @return the determinant
     */
    det() {
        return (this.xz * this.yx - this.xx * this.yz) * this.zy +
            (this.xx * this.yy - this.xy * this.yx) * this.zz +
            (this.xy * this.yz - this.xz * this.yy) * this.zx
    }

    /**
     * computes the trace of this matrix
     * @return the trace
     */
    trace() {
        return this.xx + this.yy + this.zz
    }

    /**
     * computes the transpose of this matrix
     * @return the transpose matrix
     */
    transpose() {
        return new Matrix3(
            this.xx, this.xy, this.xz,
            this.yx, this.yy, this.yz,
            this.zx, this.zy, this.zz
        )
    }

    /**
     * computes the inverse of this matrix
     * @return the inverse matrix
     */
    inv() {
        const det = this.det()
        return new Matrix3(
            (this.yy * this.zz - this.yz * this.zy) / det, (this.yz * this.zx - this.yx * this.zz) / det, (this.yx * this.zy - this.yy * this.zx) / det,
            (this.xz * this.zy - this.xy * this.zz) / det, (this.xx * this.zz - this.xz * this.zx) / det, (this.xy * this.zx - this.xx * this.zy) / det,
            (this.xy * this.yz - this.xz * this.yy) / det, (this.xz * this.yx - this.xx * this.yz) / det, (this.xx * this.yy - this.xy * this.yx) / det
        )
    }

    div(that: number) {
        return this.times(1 / that)
    }

    /**
     * computes the right division, this * that^-1
     */
    divMatrix(that: Matrix3) {
        return this.timesMatrix(that.inv())
    }

    /**
     * computes the inverse transpose of this matrix
     * @return the inverse transpose matrix
     */
    invTranspose() {
        const det = this.det()
        return new Matrix3(
            (this.yy * this.zz - this.yz * this.zy) / det, (this.xz * this.zy - this.xy * this.zz) / det, (this.xy * this.yz - this.xz * this.yy) / det,
            (this.yz * this.zx - this.yx * this.zz) / det, (this.xx * this.zz - this.xz * this.zx) / det, (this.xz * this.yx - this.xx * this.yz) / det,
            (this.yx * this.zy - this.yy * this.zx) / det, (this.xy * this.zx - this.xx * this.zy) / det, (this.xx * this.yy - this.xy * this.yx) / det
        )
    }

    /*
        The following method returns the best guess rotation matrix.
        In general, a square matrix can be represented as an
        orthogonal matrix * symmetric matrix.
            M = O*S
        A symmetric matrix's transpose is itself.
        An orthogonal matrix's transpose is its inverse.
            S^T = S
            O^T = O^-1
        If we perform the following process, we can factor out O.
            M + M^-T
            = O*S + (O*S)^-T
            = O*S + O^-T*S^-T
            = O*S + O*S^-T
            = O*(S + S^-T)
        So we see if we perform M + M^-T, the rotation, O, remains unchanged.
        Iterating M = (M + M^-T)/2, we converge the symmetric part to identity.

        This converges exponentially (one digit per iteration) when it is far from a
        rotation matrix, and quadratically (double the digits each iteration) when it
        is close to a rotation matrix.
     */
    /**
     * computes the nearest orthonormal matrix to this matrix
     * @return the rotation matrix
     */
    orthonormalize() {
        if (this.det() <= 0) { // maybe this doesn't have to be so
            throw 'Attempt to convert non-positive determinant matrix to rotation matrix'
        }

        var curMat: Matrix3 = this
        var curDet = Infinity

        for (var i = 0; i < 100; ++i) {
            const newMat = curMat.plus(curMat.invTranspose()).div(2)
            const newDet = Math.abs(newMat.det())
            // should almost always exit immediately
            if (newDet >= curDet) return curMat
            if (newDet <= 1.0000001) return newMat
            curMat = newMat
            curDet = newDet
        }

        return curMat
    }

    /**
     * finds the rotation matrix closest to all given rotation matrices.
     * multiply input matrices by a weight for weighted averaging.
     * WARNING: NOT ANGULAR
     * @param others a variable number of additional boxed matrices to average
     * @return the average rotation matrix
     */
    average(others: Matrix3[]): Matrix3 {
        var count = 1
        var sum: Matrix3 = this
        others.forEach((it) => {
            count += 1
            sum = sum.plus(it)
        })
        return sum.div(count).orthonormalize()
    }

    /**
     * linearly interpolates this matrix to that matrix by t
     * @param that the matrix towards which to interpolate
     * @param t the amount by which to interpolate
     * @return the interpolated matrix
     */
    lerp(that: Matrix3, t: number) {
        return this.times(1 - t).plus(that.times(t))
    }


    // assumes this matrix is orthonormal and converts this to a quaternion
    /**
     * creates a quaternion representing the same rotation as this matrix,
     * assuming the matrix is a rotation matrix
     * @return the quaternion
     */
    toQuaternionAssumingOrthonormal() {
        if (this.yy > -this.zz && this.zz > -this.xx && this.xx > -this.yy) {
            return new Quaternion(1 + this.xx + this.yy + this.zz, this.yz - this.zy, this.zx - this.xz, this.xy - this.yx).unit()
        } else if (this.xx > this.yy && this.xx > this.zz) {
            return new Quaternion(this.yz - this.zy, 1 + this.xx - this.yy - this.zz, this.xy + this.yx, this.xz + this.zx).unit()
        } else if (this.yy > this.zz) {
            return new Quaternion(this.zx - this.xz, this.xy + this.yx, 1 - this.xx + this.yy - this.zz, this.yz + this.zy).unit()
        } else {
            return new Quaternion(this.xy - this.yx, this.xz + this.zx, this.yz + this.zy, 1 - this.xx - this.yy + this.zz).unit()
        }
    }

    // orthogonalizes the matrix then returns the quaternion
    /**
     * creates a quaternion representing the same rotation as this matrix
     * @return the quaternion
     */
    toQuaternion() {
        return this.orthonormalize().toQuaternionAssumingOrthonormal()
    }

    /*
        the standard algorithm:
 
        yAng = asin(clamp(zx, -1, 1))
        if (abs(zx) < 0.9999999f) {
            xAng = atan2(-zy, zz)
            zAng = atan2(-yx, xx)
        } else {
            xAng = atan2(yz, yy)
            zAng = 0
        }
 
 
 
        problems with the standard algorithm:
 
    1)
            yAng = asin(clamp(zx, -1, 1))
 
    FIX:
            yAng = atan2(zx, sqrt(zy*zy + zz*zz))
 
        this loses many bits of accuracy when near the singularity, zx = +-1 and
        can cause the algorithm to return completely inaccurate results with only
        small floating point errors in the matrix. this happens because zx is
        NOT sin(pitch), but rather errorTerm*sin(pitch), and small changes in zx
        when zx is near +-1 make large changes in asin(zx).
 
 
 
    2)
            if (abs(zx) < 0.9999999f) {
 
    FIX:
            if (zy*zy + zz*zz > 0f) {
 
        this clause, meant to reduce the inaccuracy of the code following does
        not actually test for the condition that makes the following atans unstable.
        that is, when (zy, zz) and (yx, xx) are near 0.
        after several matrix multiplications, the error term is expected to be
        larger than 0.0000001. Often times, this clause will not catch the conditions
        it is trying to catch.
 
 
 
    3)
            zAng = atan2(-yx, xx)
 
    FIX:
            zAng = atan2(xy*zz - xz*zy, yy*zz - yz*zy)
 
        xAng and zAng are being computed separately. In the case of near singularity
        the angles of xAng and zAng are effectively added together as they represent
        the same operation (a rotation about the global y-axis). When computed
        separately, it is not guaranteed that the xAng + zAng add together to give
        the actual final rotation about the global y-axis.
 
 
 
    4)
        after many matrix operations are performed, without orthonormalization
        the matrix will contain floating point errors that will throw off the
        accuracy of any euler angles algorithm. orthonormalization should be
        built into the prerequisites for this function
     */

    /**
     * creates an eulerAngles representing the same rotation as this matrix,
     * assuming the matrix is a rotation matrix
     * @return the eulerAngles
     */
    toEulerAnglesAssumingOrthonormal(order: EulerOrder) {
        const ETA = 1.5707964
        switch (order) {
            case EulerOrder.XYZ: {
                const kc = Math.sqrt(this.zy * this.zy + this.zz * this.zz)
                if (kc < 1e-7) {
                    return new EulerAngles(
                        EulerOrder.XYZ,
                        Math.atan2(this.yz, this.yy),
                        ETA * Math.sign(this.zx),
                        0
                    )
                }

                return new EulerAngles(
                    EulerOrder.XYZ,
                    Math.atan2(-this.zy, this.zz),
                    Math.atan2(this.zx, kc),
                    Math.atan2(this.xy * this.zz - this.xz * this.zy, this.yy * this.zz - this.yz * this.zy)
                )
            }
            case EulerOrder.YZX: {
                const kc = Math.sqrt(this.xx * this.xx + this.xz * this.xz)
                if (kc < 1e-7) {
                    return new EulerAngles(
                        EulerOrder.YZX,
                        0,
                        Math.atan2(this.zx, this.zz),
                        ETA * Math.sign(this.xy)
                    )
                }

                return new EulerAngles(
                    EulerOrder.YZX,
                    Math.atan2(this.xx * this.yz - this.xz * this.yx, this.xx * this.zz - this.xz * this.zx),
                    Math.atan2(-this.xz, this.xx),
                    Math.atan2(this.xy, kc)
                )
            }
            case EulerOrder.ZXY: {
                const kc = Math.sqrt(this.yy * this.yy + this.yx * this.yx)
                if (kc < 1e-7) {
                    return new EulerAngles(
                        EulerOrder.ZXY,
                        ETA * Math.sign(this.yz),
                        0,
                        Math.atan2(this.xy, this.xx)
                    )
                }

                return new EulerAngles(
                    EulerOrder.ZXY,
                    Math.atan2(this.yz, kc),
                    Math.atan2(this.yy * this.zx - this.yx * this.zy, this.yy * this.xx - this.yx * this.xy),
                    Math.atan2(-this.yx, this.yy)
                )
            }
            case EulerOrder.ZYX: {
                const kc = Math.sqrt(this.xy * this.xy + this.xx * this.xx)
                if (kc < 1e-7) {
                    return new EulerAngles(
                        EulerOrder.ZYX,
                        0,
                        ETA * Math.sign(-this.xz),
                        Math.atan2(-this.yx, this.yy)
                    )
                }

                return new EulerAngles(
                    EulerOrder.ZYX,
                    Math.atan2(this.zx * this.xy - this.zy * this.xx, this.yy * this.xx - this.yx * this.xy),
                    Math.atan2(-this.xz, kc),
                    Math.atan2(this.xy, this.xx)
                )
            }

            case EulerOrder.YXZ: {
                const kc = Math.sqrt(this.zx * this.zx + this.zz * this.zz)
                if (kc < 1e-7) {
                    return new EulerAngles(
                        EulerOrder.YXZ,
                        ETA * Math.sign(-this.zy),
                        Math.atan2(-this.xz, this.xx),
                        0
                    )
                }

                return new EulerAngles(
                    EulerOrder.YXZ,
                    Math.atan2(-this.zy, kc),
                    Math.atan2(this.zx, this.zz),
                    Math.atan2(this.yz * this.zx - this.yx * this.zz, this.xx * this.zz - this.xz * this.zx)
                )
            }
            case EulerOrder.XZY: {
                const kc = Math.sqrt(this.yz * this.yz + this.yy * this.yy)
                if (kc < 1e-7) {
                    return new EulerAngles(
                        EulerOrder.XZY,
                        Math.atan2(-this.zy, this.zz),
                        0,
                        ETA * Math.sign(-this.yx)
                    )
                }

                return new EulerAngles(
                    EulerOrder.XZY,
                    Math.atan2(this.yz, this.yy),
                    Math.atan2(this.xy * this.yz - this.xz * this.yy, this.zz * this.yy - this.zy * this.yz),
                    Math.atan2(-this.yx, kc)
                )
            }
        }
    }

    // orthogonalizes the matrix then returns the euler angles
    /**
     * creates an eulerAngles representing the same rotation as this matrix
     * @return the eulerAngles
     */
    toEulerAngles(order: EulerOrder) {
        return this.orthonormalize().toEulerAnglesAssumingOrthonormal(order)
    }

    toString() {
        return `[${this.xRow},${this.yRow},${this.zRow}]`
    }
}

export class EulerAngles {
    order: EulerOrder
    x: number
    y: number
    z: number
    constructor(order: EulerOrder, x: number, y: number, z: number) {
        this.order = order
        this.x = x
        this.y = y
        this.z = z
    }
    get component1() {
        return this.order
    }
    get component2() {
        return this.x
    }
    get component3() {
        return this.y
    }
    get component4() {
        return this.z
    }

    /**
     * creates a quaternion which represents the same rotation as this eulerAngles
     * @return the quaternion
     */
    toQuaternion() {
        const cX = Math.cos(this.x / 2)
        const cY = Math.cos(this.y / 2)
        const cZ = Math.cos(this.z / 2)
        const sX = Math.sin(this.x / 2)
        const sY = Math.sin(this.y / 2)
        const sZ = Math.sin(this.z / 2)

        switch (this.order) {
            case EulerOrder.XYZ: {
                return new Quaternion(
                    cX * cY * cZ - sX * sY * sZ,
                    cY * cZ * sX + cX * sY * sZ,
                    cX * cZ * sY - cY * sX * sZ,
                    cZ * sX * sY + cX * cY * sZ,
                )
            }

            case EulerOrder.YZX: {
                return new Quaternion(
                    cX * cY * cZ - sX * sY * sZ,
                    cY * cZ * sX + cX * sY * sZ,
                    cX * cZ * sY + cY * sX * sZ,
                    cX * cY * sZ - cZ * sX * sY,
                )
            }

            case EulerOrder.ZXY: {
                return new Quaternion(
                    cX * cY * cZ - sX * sY * sZ,
                    cY * cZ * sX - cX * sY * sZ,
                    cX * cZ * sY + cY * sX * sZ,
                    cZ * sX * sY + cX * cY * sZ,
                )
            }

            case EulerOrder.ZYX: {
                return new Quaternion(
                    cX * cY * cZ + sX * sY * sZ,
                    cY * cZ * sX - cX * sY * sZ,
                    cX * cZ * sY + cY * sX * sZ,
                    cX * cY * sZ - cZ * sX * sY,
                )
            }

            case EulerOrder.YXZ: {
                return new Quaternion(
                    cX * cY * cZ + sX * sY * sZ,
                    cY * cZ * sX + cX * sY * sZ,
                    cX * cZ * sY - cY * sX * sZ,
                    cX * cY * sZ - cZ * sX * sY,
                )
            }

            case EulerOrder.XZY: {
                return new Quaternion(
                    cX * cY * cZ + sX * sY * sZ,
                    cY * cZ * sX - cX * sY * sZ,
                    cX * cZ * sY - cY * sX * sZ,
                    cZ * sX * sY + cX * cY * sZ,
                )
            }
        }
    }

    // temp, replace with direct conversion later
    // fun toMatrix(): Matrix3 = this.toQuaternion().toMatrix()
    /**
     * creates a matrix which represents the same rotation as this eulerAngles
     * @return the matrix
     */
    toMatrix() {
        const cX = Math.cos(this.x)
        const cY = Math.cos(this.y)
        const cZ = Math.cos(this.z)
        const sX = Math.sin(this.x)
        const sY = Math.sin(this.y)
        const sZ = Math.sin(this.z)

        switch (this.order) {
            // ktlint ruining spacing
            case EulerOrder.XYZ: {
                return new Matrix3(
                    cY * cZ, -cY * sZ, sY,
                    cZ * sX * sY + cX * sZ, cX * cZ - sX * sY * sZ, -cY * sX,
                    sX * sZ - cX * cZ * sY, cZ * sX + cX * sY * sZ, cX * cY)
            }

            case EulerOrder.YZX: {
                return new Matrix3(
                    cY * cZ, sX * sY - cX * cY * sZ, cX * sY + cY * sX * sZ,
                    sZ, cX * cZ, -cZ * sX,
                    -cZ * sY, cY * sX + cX * sY * sZ, cX * cY - sX * sY * sZ)
            }

            case EulerOrder.ZXY: {
                return new Matrix3(
                    cY * cZ - sX * sY * sZ, -cX * sZ, cZ * sY + cY * sX * sZ,
                    cZ * sX * sY + cY * sZ, cX * cZ, sY * sZ - cY * cZ * sX,
                    -cX * sY, sX, cX * cY)
            }

            case EulerOrder.ZYX: {
                return new Matrix3(
                    cY * cZ, cZ * sX * sY - cX * sZ, cX * cZ * sY + sX * sZ,
                    cY * sZ, cX * cZ + sX * sY * sZ, cX * sY * sZ - cZ * sX,
                    -sY, cY * sX, cX * cY)
            }

            case EulerOrder.YXZ: {
                return new Matrix3(
                    cY * cZ + sX * sY * sZ, cZ * sX * sY - cY * sZ, cX * sY,
                    cX * sZ, cX * cZ, -sX,
                    cY * sX * sZ - cZ * sY, cY * cZ * sX + sY * sZ, cX * cY)
            }

            case EulerOrder.XZY: {
                return new Matrix3(
                    cY * cZ, -sZ, cZ * sY,
                    sX * sY + cX * cY * sZ, cX * cZ, cX * sY * sZ - cY * sX,
                    cY * sX * sZ - cX * sY, cZ * sX, cX * cY + sX * sY * sZ)
            }
        }
    }

    toString() {
        return `[${this.order}:${this.x},${this.y},${this.z}]`
    }
}

export class Quaternion {

    static NULL = new Quaternion(0, 0, 0, 0)
    static IDENTITY = new Quaternion(1, 0, 0, 0)
    static I = new Quaternion(0, 1, 0, 0)
    static J = new Quaternion(0, 0, 1, 0)
    static K = new Quaternion(0, 0, 0, 1)
    static FRONT = new Quaternion(0, 0, 1, 0)
    static FRONT_LEFT = new Quaternion(0.383, 0, 0.924, 0)
    static LEFT = new Quaternion(0.707, 0, 0.707, 0)
    static BACK_LEFT = new Quaternion(0.924, 0, 0.383, 0)
    static FRONT_RIGHT = new Quaternion(0.383, 0, -0.924, 0)
    static RIGHT = new Quaternion(0.707, 0, -0.707, 0)
    static BACK_RIGHT = new Quaternion(0.924, 0, -0.383, 0)
    static BACK = new Quaternion(1, 0, 0, 0)

    w: number
    x: number
    y: number
    z: number
    constructor(w: number, x: number, y: number, z: number) {
        this.w = w
        this.x = x
        this.y = y
        this.z = z
    }

    static fromWVector(w: number, v: Vector3) {
        return new Quaternion(w, v.x, v.y, v.z)
    }

    /**
     * creates a new quaternion representing the rotation about v's axis
     * by an angle of v's length
     * @param v the rotation vector
     * @return the new quaternion
     **/
    static fromRotationVectorVec(v: Vector3) {
        return Quaternion.fromWVector(0, v.div(2)).exp()
    }

    /**
     * creates a new quaternion representing the rotation about axis v
     * by an angle of v's length
     * @param vx the rotation vector's x component
     * @param vy the rotation vector's y component
     * @param vz the rotation vector's z component
     * @return the new quaternion
     **/
    static fromRotationVector(vx: number, vy: number, vz: number) {
        return Quaternion.fromRotationVectorVec(new Vector3(vx, vy, vz))
    }


    /**
     * finds Q, the smallest-angled quaternion whose local u direction aligns with
     * the global v direction.
     * @param u the local direction
     * @param v the global direction
     * @return Q
     **/
    static fromTo(u: Vector3, v: Vector3) {
        const qu = Quaternion.fromWVector(0, u)
        const qv = Quaternion.fromWVector(0, v)
        const d = qv.divQuat(qu)

        return d.plus(d.len()).unit()
    }

    /**
     * @return the imaginary components as a vector3
     **/
    get xyz() {
        return new Vector3(this.x, this.y, this.z)
    }

    /**
     * @return the quaternion with only the w component
     **/
    get re() {
        return new Quaternion(this.w, 0, 0, 0)
    }

    /**
     * @return the quaternion with only x y z components
     **/
    get im() {
        return new Quaternion(0, this.x, this.y, this.z)
    }

    unaryMinus() {
        return new Quaternion(-this.w, -this.x, -this.y, -this.z)
    }

    plusQuat(that: Quaternion) {
        return new Quaternion(
            this.w + that.w,
            this.x + that.x,
            this.y + that.y,
            this.z + that.z,
        )
    }

    plus(that: number) {
        return new Quaternion(this.w + that, this.x, this.y, this.z)
    }

    minusQuat(that: Quaternion) {
        return new Quaternion(
            this.w - that.w,
            this.x - that.x,
            this.y - that.y,
            this.z - that.z,
        )
    }

    minus(that: number) {
        return new Quaternion(this.w - that, this.x, this.y, this.z)
    }

    /**
     * computes the dot product of this quaternion with that quaternion
     * @param that the quaternion with which to be dotted
     * @return the inverse quaternion
     **/
    dot(that: Quaternion) {
        return this.w * that.w + this.x * that.x + this.y * that.y + this.z * that.z
    }

    /**
     * computes the square of the length of this quaternion
     * @return the length squared
     **/
    lenSq() {
        return this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z
    }

    /**
     * computes the length of this quaternion
     * @return the length
     **/
    len() {
        return Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z)
    }

    /**
     * @return the normalized quaternion
     **/
    unit() {
        const m = this.len()
        if (m == 0)
            return null
        else
            return this.div(m)
    }

    times(that: number) {
        return new Quaternion(
            this.w * that,
            this.x * that,
            this.y * that,
            this.z * that,
        )
    }

    timesQuat(that: Quaternion) {
        return new Quaternion(
            this.w * that.w - this.x * that.x - this.y * that.y - this.z * that.z,
            this.x * that.w + this.w * that.x - this.z * that.y + this.y * that.z,
            this.y * that.w + this.z * that.x + this.w * that.y - this.x * that.z,
            this.z * that.w - this.y * that.x + this.x * that.y + this.w * that.z,
        )
    }

    /**
     * computes the inverse of this quaternion
     * @return the inverse quaternion
     **/
    inv() {
        const lenSq = this.lenSq()
        return new Quaternion(
            this.w / lenSq,
            -this.x / lenSq,
            -this.y / lenSq,
            -this.z / lenSq,
        )
    }

    div(that: number) {
        return this.times(1 / that)
    }

    /**
     * computes right division, this * that^-1
     **/
    divQuat(that: Quaternion) {
        return this.timesQuat(that.inv())
    }

    get component1() {
        return this.w
    }
    get component2() {
        return this.x
    }
    get component3() {
        return this.y
    }
    get component4() {
        return this.z
    }

    /**
     * @return the conjugate of this quaternion
     **/
    conj() {
        return new Quaternion(this.w, -this.x, -this.y, -this.z)
    }

    /**
     * computes the logarithm of this quaternion
     * @return the log of this quaternion
     **/
    log() {
        const co = this.w
        const si = this.xyz.len()
        const len = this.len()

        if (si == 0) {
            return Quaternion.fromWVector(Math.log(len), this.xyz.div(this.w))
        }

        const ang = Math.atan2(si, co)
        return Quaternion.fromWVector(Math.log(len), this.xyz.times(ang / si))
    }

    /**
     * raises e to the power of this quaternion
     * @return the exponentiated quaternion
     **/
    exp() {
        const ang = this.xyz.len()
        const len = Math.exp(this.w)

        if (ang == 0) {
            return Quaternion.fromWVector(len, this.xyz.times(len))
        }

        const co = Math.cos(ang)
        const si = Math.sin(ang)
        return Quaternion.fromWVector(len * co, this.xyz.times(len * si / ang))
    }

    /**
     * raises this quaternion to the power of t
     * @param t the power by which to raise this quaternion
     * @return the powered quaternion
     **/
    pow(t: number) {
        return this.log().times(t).exp()
    }

    /**
     * between this and -this, picks the one nearest to that quaternion
     * @param that the quaternion to be nearest
     * @return nearest quaternion
     **/
    twinNearest(that: Quaternion) {
        if (this.dot(that) < 0)
            return this.unaryMinus()
        else
            return this
    }

    /**
     * interpolates from this quaternion to that quaternion by t in quaternion space
     * @param that the quaternion to interpolate to
     * @param t the amount to interpolate
     * @return interpolated quaternion
     **/
    interpQ(that: Quaternion, t: number) {
        if (t == 0) {
            return this
        } else if (t == 1) {
            return that
        } else if (t < 0.5) {
            return that.divQuat(this).pow(t).timesQuat(this)
        } else {
            return this.divQuat(that).pow(1 - t).timesQuat(that)
        }
    }

    /**
     * interpolates from this quaternion to that quaternion by t in rotation space
     * @param that the quaternion to interpolate to
     * @param t the amount to interpolate
     * @return interpolated quaternion
     **/
    interpR(that: Quaternion, t: number) {
        return this.interpQ(that.twinNearest(this), t)
    }

    /**
     * linearly interpolates from this quaternion to that quaternion by t in
     * quaternion space
     * @param that the quaternion to interpolate to
     * @param t the amount to interpolate
     * @return interpolated quaternion
     **/
    lerpQ(that: Quaternion, t: number) {
        return this.times(1 - t).plusQuat(that.times(t))
    }

    /**
     * linearly interpolates from this quaternion to that quaternion by t in
     * rotation space
     * @param that the quaternion to interpolate to
     * @param t the amount to interpolate
     * @return interpolated quaternion
     **/
    lerpR(that: Quaternion, t: number) {
        return this.lerpQ(that.twinNearest(this), t)
    }

    /**
     * computes this quaternion's angle to identity in quaternion space
     * @return angle
     **/
    angleQ() {
        return Math.atan2(this.xyz.len(), this.w)
    }

    /**
     * computes this quaternion's angle to identity in rotation space
     * @return angle
     **/
    angleR() {
        return 2 * Math.atan2(this.xyz.len(), Math.abs(this.w))
    }

    /**
     * computes the angle between this quaternion and that quaternion in quaternion space
     * @param that the other quaternion
     * @return angle
     **/
    angleToQ(that: Quaternion) {
        return this.divQuat(that).angleQ()
    }

    /**
     * computes the angle between this quaternion and that quaternion in rotation space
     * @param that the other quaternion
     * @return angle
     **/
    angleToR(that: Quaternion) {
        return this.divQuat(that).angleR()
    }

    /**
     * computes the angle this quaternion rotates about the u axis in quaternion space
     * @param u the axis
     * @return angle
     **/
    angleAboutQ(u: Vector3) {
        const si = u.dot(this.xyz)
        const co = u.len() * this.w
        return Math.atan2(si, co)
    }

    /**
     * computes the angle this quaternion rotates about the u axis in rotation space
     * @param u the axis
     * @return angle
     **/
    angleAboutR(u: Vector3) {
        return 2 * this.twinNearest(Quaternion.IDENTITY).angleAboutQ(u)
    }

    /**
     * finds Q, the quaternion nearest to this quaternion representing a rotation purely
     * about the global u axis. Q is NOT unitized
     * @param v the global axis
     * @return Q
     **/
    project(v: Vector3) {
        return Quaternion.fromWVector(this.w, v.times(this.xyz.dot(v) / v.lenSq()))
    }

    /**
     * finds Q, the quaternion nearest to this quaternion representing a rotation NOT
     * on the global u axis. Q is NOT unitized
     * @param v the global axis
     * @return Q
     **/
    reject(v: Vector3) {
        return Quaternion.fromWVector(this.w, v.cross(this.xyz).cross(v).div(v.lenSq()))
    }

    /**
     * finds Q, the quaternion nearest to this quaternion whose local u direction aligns
     * with the global v direction. Q is NOT unitized
     * @param u the local direction
     * @param v the global direction
     * @return Q
     **/
    align(u: Vector3, v: Vector3) {
        const qu = Quaternion.fromWVector(0, u)
        const qv = Quaternion.fromWVector(0, v)

        return qv.timesQuat(this).divQuat(qu).plusQuat(this.times(qv.divQuat(qu).len())).div(2)
    }

    /**
     * Produces angles such that
     * Quaternion.fromRotationVector(angles[0]*axisA.unit()) * Quaternion.fromRotationVector(angles[1]*axisB.unit())
     * is as close to rot as possible
     */
    static biAlign(rot: Quaternion, axisA: Vector3, axisB: Vector3) {
        const a = axisA.unit()
        const b = axisB.unit()


        const aQ = a!.dot(rot.xyz)
        const bQ = b!.dot(rot.xyz)
        const abQ = a!.cross(b!).dot(rot.xyz) - a!.dot(b!) * rot.w

        const angleA = Math.atan2(2 * (abQ * bQ + aQ * rot.w), rot.w * rot.w - aQ * aQ + bQ * bQ - abQ * abQ)
        const angleB = Math.atan2(2 * (abQ * aQ + bQ * rot.w), rot.w * rot.w + aQ * aQ - bQ * bQ - abQ * abQ)

        return [angleA, angleB]
    }

    /**
     * applies this quaternion's rotation to that vector
     * @param that the vector to be transformed
     * @return that vector transformed by this quaternion
     **/
    sandwich(that: Vector3) {
        return this.timesQuat(Quaternion.fromWVector(0, that)).divQuat(this).xyz
    }

    /**
     * computes this quaternion's unit length rotation axis
     * @return rotation axis
     **/
    axis() {
        return this.xyz.unit()
    }

    /**
     * computes the rotation vector representing this quaternion's rotation
     * @return rotation vector
     **/
    toRotationVector() {
        return this.twinNearest(Quaternion.IDENTITY).log().xyz.times(2)
    }

    /**
     * computes the matrix representing this quaternion's rotation
     * @return rotation matrix
     **/
    toMatrix(): Matrix3 {
        const d = this.lenSq()
        return new Matrix3(
            (this.w * this.w + this.x * this.x - this.y * this.y - this.z * this.z) / d, 2 * (this.x * this.y - this.w * this.z) / d, 2 * (this.w * this.y + this.x * this.z) / d,
            2 * (this.x * this.y + this.w * this.z) / d, (this.w * this.w - this.x * this.x + this.y * this.y - this.z * this.z) / d, 2 * (this.y * this.z - this.w * this.x) / d,
            2 * (this.x * this.z - this.w * this.y) / d, 2 * (this.w * this.x + this.y * this.z) / d, (this.w * this.w - this.x * this.x - this.y * this.y + this.z * this.z) / d)
    }

    /**
     * computes the euler angles representing this quaternion's rotation
     * @param order the order in which to decompose this quaternion into euler angles
     * @return euler angles
     **/
    toEulerAngles(order: EulerOrder) {
        return this.toMatrix().toEulerAnglesAssumingOrthonormal(order)
    }

    toString() {
        return `[${this.w},${this.x},${this.y},${this.z}]`
    }
}
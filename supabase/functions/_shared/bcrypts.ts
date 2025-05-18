// Copyright (c) 2012 Damien Miller <djm@mindrot.org>
//
//Permission to use, copy, modify, and distribute this software for any
//purpose with or without fee is hereby granted, provided that the above
//copyright notice and this permission notice appear in all copies.
//
//THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
//WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
//MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
//ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
//WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
//ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
//OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

// Bcrypt an adaptation of bcrypt_pbkdf.c from OpenBSD
// Bcrypt is released under the ISC license

/**
 * @fileoverview Bcrypt is a JavaScript adaption of bcrypt_pbkdf.c from OpenBSD.
 * @author dcodeIO|DJM
 * @version 1.0.0
 * @license ISC
 */

    // Characters for base64 encoding
    const BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    // Regular expression for base64 format
    const BASE64_REGEX = /^[a-zA-Z0-9\.\/]+$/;

    // Default number of rounds if not specified
    const DEFAULT_ROUNDS = 10;

    // Minimum and maximum number of rounds allowed
    const MIN_ROUNDS = 4;
    const MAX_ROUNDS = 31;

    // Salt length
    const SALT_LEN = 16; // Bcrypt salt length
    const BCRYPT_SALT_LEN = 22; // Base64 encoded salt length

    // Ciphertext constants from bcrypt_pbkdf.c
    const BF_N = 16;
    const BF_BLOCK = 8;
    const CIPHERTEXT_LEN = BF_N + BF_BLOCK; // Length of the ciphertext block

    // P and S box values from bcrypt_pbkdf.c
    const P_ORIG = [
        0x243f6a88, 0x85a308d3, 0x13198a2e, 0x03707344, 0xa4093822, 0x299f31d0, 0x082efa98, 0xec4e6c89,
        0x452821e6, 0x38d01377, 0xbe5466cf, 0x34e90c6c, 0xc0ac29b7, 0xc97c50dd, 0x3f84d5b5, 0xb5470917,
        0x9216d5d9, 0x8979fb1b
    ];

    const S_ORIG = [
        [0xd1310ba6, 0x98dfb5ac, 0x2ffd72db, 0xd01adfb7, 0xb8e1afed, 0x6a267e96, 0xba7c9045, 0xf12c7f99,
         0x24a19947, 0xb3916cf7, 0x0801f2e2, 0x858efc16, 0x636920d8, 0x71574e69, 0xa458fea3, 0xf4933d7e],
        [0x0d95748f, 0x728eb658, 0x718bcd58, 0x82154aee, 0x7b54a41d, 0xc25a59b5, 0x9c30d539, 0x2af26013,
         0xc5d1b023, 0x286085f0, 0xca417918, 0xb8db38ef, 0x8e79dcb0, 0x603a180e, 0x6c9e0e8b, 0xb01e8a3e],
        [0xd7d3fbc8, 0x2158a990, 0x0b05688c, 0xa0385c15, 0x770489d8, 0xc24af360, 0x74e1fb6c, 0xc3ac94c0,
         0x54905d82, 0x2a64537e, 0xf0909abb, 0x59ee3442, 0x4231ad58, 0xba0ad570, 0x44046d03, 0x82bbf629],
        [0x295ab999, 0xb05099e3, 0xc9bc0585, 0x48defb0f, 0x846efa70, 0x5686e741, 0xd3092fbd, 0x623f8784,
         0x9184c581, 0xde80c895, 0x8bf082ae, 0x726f36e8, 0xec1e03fe, 0x2e9c78c4, 0x6478c48f, 0xde740408]
    ];

    // Initialize P and S boxes
    let P = P_ORIG.slice();
    let S = S_ORIG.map(arr => arr.slice());

    // Encode data to base64
    function encode_base64(d, len) {
        let off = 0;
        let rs = "";
        let c1, c2;
        if (len <= 0 || len > d.length) {
            throw new Error("Invalid len");
        }
        while (off < len) {
            c1 = d[off++] & 0xff;
            rs += BASE64_CODE.charAt(c1 >> 2);
            c1 = (c1 & 0x03) << 4;
            if (off >= len) {
                rs += BASE64_CODE.charAt(c1);
                break;
            }
            c2 = d[off++] & 0xff;
            c1 |= (c2 >> 4) & 0x0f;
            rs += BASE64_CODE.charAt(c1);
            c1 = (c2 & 0x0f) << 2;
            if (off >= len) {
                rs += BASE64_CODE.charAt(c1);
                break;
            }
            c2 = d[off++] & 0xff;
            c1 |= (c2 >> 6) & 0x03;
            rs += BASE64_CODE.charAt(c1);
            rs += BASE64_CODE.charAt(c2 & 0x3f);
        }
        return rs;
    }

    // Decode base64 data
    function decode_base64(s, maxolen) {
        let off = 0, slen = s.length, olen = 0;
        let rs = [];
        let c1, c2, c3, c4, o, code;

        if (!BASE64_REGEX.test(s)) {
            throw new Error("Invalid base64 string");
        }

        while (off < slen) {
            code = BASE64_CODE.indexOf(s.charAt(off++));
            if (code === -1) throw Error("invalid char");
            c1 = code;
            
            code = BASE64_CODE.indexOf(s.charAt(off++));
            if (code === -1) throw Error("invalid char");
            c2 = code;

            if (olen < maxolen) {
                o = (c1 << 2) | ((c2 >> 4) & 0x03);
                rs.push(String.fromCharCode(o));
                olen++;
            } else break;

            if (off >= slen) break;
            code = BASE64_CODE.indexOf(s.charAt(off++));
            if (code === -1) {
                 if (off -1 < slen && s.charAt(off-1) !== '=') throw Error("invalid char"); // Allow padding for other b64 variants, but not ours for salts
                 break;
            }
            c3 = code;

            if (olen < maxolen) {
                o = ((c2 << 4) & 0xf0) | ((c3 >> 2) & 0x0f);
                rs.push(String.fromCharCode(o));
                olen++;
            } else break;

            if (off >= slen) break;
            code = BASE64_CODE.indexOf(s.charAt(off++));
             if (code === -1) {
                 if (off -1 < slen && s.charAt(off-1) !== '=') throw Error("invalid char");
                 break;
            }
            c4 = code;

            if (olen < maxolen) {
                o = ((c3 << 6) & 0xc0) | (c4 & 0x3f);
                rs.push(String.fromCharCode(o));
                olen++;
            } else break;
        }
        return rs.join("");
    }

    // Blowfish encryption
    function encipher(lr, off) {
        let n, l = lr[off], r = lr[off + 1];
        l ^= P[0];
        for (let i = 1; i <= BF_N; i += 2) {
            n = S[0][l >>> 24];
            n += S[1][(l >>> 16) & 0xff];
            n ^= S[2][(l >>> 8) & 0xff];
            n += S[3][l & 0xff];
            r ^= n ^ P[i];
            n = S[0][r >>> 24];
            n += S[1][(r >>> 16) & 0xff];
            n ^= S[2][(r >>> 8) & 0xff];
            n += S[3][r & 0xff];
            l ^= n ^ P[i + 1];
        }
        lr[off] = r ^ P[BF_N + 1];
        lr[off + 1] = l;
    }

    // Initialize Blowfish state
    function init_key() {
        P = P_ORIG.slice();
        S = S_ORIG.map(arr => arr.slice());
    }

    // Key setup for Blowfish
    function ekskey(key, salt) {
        let koff = 0, lr = [0, 0];
        let i, j, plen = P.length, slen = S.length;

        // Initialize P and S boxes
        init_key();

        // XOR P-boxes with salt
        for (i = 0; i < plen; i++) {
            P[i] ^= salt[koff++ % salt.length].charCodeAt(0);
        }

        koff = 0;
        // Encrypt P-boxes with current P and S boxes
        for (i = 0; i < plen; i += 2) {
            encipher(lr, 0);
            P[i] = lr[0];
            P[i + 1] = lr[1];
        }

        // Encrypt S-boxes with current P and S boxes
        for (i = 0; i < slen; i++) {
            for (j = 0; j < S[i].length; j += 2) {
                encipher(lr, 0);
                S[i][j] = lr[0];
                S[i][j + 1] = lr[1];
            }
        }

        koff = 0;
        // XOR P-boxes with key
        for (i = 0; i < plen; i++) {
            P[i] ^= key[koff++ % key.length].charCodeAt(0);
        }

        koff = 0;
        // Encrypt P-boxes with key and current P and S boxes
        for (i = 0; i < plen; i += 2) {
            encipher(lr, 0);
            P[i] = lr[0];
            P[i + 1] = lr[1];
        }

        // Encrypt S-boxes with key and current P and S boxes
        for (i = 0; i < slen; i++) {
            for (j = 0; j < S[i].length; j += 2) {
                encipher(lr, 0);
                S[i][j] = lr[0];
                S[i][j + 1] = lr[1];
            }
        }
    }

    // Raw Blowfish encryption
    function crypt_raw(data, salt, rounds) {
        let i, j, koff, lr = [0, 0];
        const clen = CIPHERTEXT_LEN;
        let cdata = "OrpheanBeholderScryDoubt".split('').map(c => c.charCodeAt(0)); //"OrpheanBeholderScryDoubt"
        let datalen = data.length;

        if (datalen > 72) {
            throw new Error("Password too long");
        }

        ekskey(salt, data);

        for (i = 0; i < rounds; i++) {
            ekskey(data, salt);
            ekskey(salt, data);
        }

        for (i = 0; i < clen; i++) {
            lr[0] = cdata[i * 2];
            lr[1] = cdata[i * 2 + 1];
            encipher(lr, 0);
            cdata[i * 2] = lr[0];
            cdata[i * 2 + 1] = lr[1];
        }

        let ret = [];
        for (i = 0; i < clen; i++) {
            ret.push(String.fromCharCode(cdata[i]));
        }
        return ret.join("");
    }

    // Generate salt string
    function gensalt_raw(rounds) {
        if (rounds < MIN_ROUNDS || rounds > MAX_ROUNDS) {
            throw new Error("Bad number of rounds");
        }
        let rs = "";
        for (let i = 0; i < SALT_LEN; i++) {
            rs += String.fromCharCode(Math.floor(Math.random() * 256));
        }
        return rs;
    }

    // Public API functions

    /**
     * Generates a salt synchronously.
     * @param {number=} rounds Number of rounds to use, defaults to 10 if omitted
     * @returns {string} Resulting salt
     * @throws {Error} If rounds is out of range
     */
    export function genSaltSync(rounds) {
        rounds = rounds || DEFAULT_ROUNDS;
        if (typeof rounds !== 'number') {
            throw new Error("rounds must be a number");
        }
        if (rounds < MIN_ROUNDS || rounds > MAX_ROUNDS) {
            throw new Error("Bad number of rounds");
        }

        let salt = "$2a$";
        if (rounds < 10) salt += "0";
        salt += rounds.toString() + "$";
        salt += encode_base64(gensalt_raw(rounds).split('').map(c=>c.charCodeAt(0)), SALT_LEN);
        return salt;
    }

    /**
     * Hashes a password synchronously.
     * @param {string} s Password to hash
     * @param {(string|number)=} salt Salt to hash with, or number of rounds to generate a salt with. 
     *                             If a number is provided, it will be used as the number of rounds 
     *                             to generate a salt. If omitted, a salt will be generated with 10 rounds.
     * @returns {string} Resulting hash
     */
    export function hashSync(s, salt) {
        if (typeof s !== 'string') {
            throw new Error("password must be a string");
        }
        if (salt == null) { // null or undefined
            salt = genSaltSync(DEFAULT_ROUNDS);
        } else if (typeof salt === 'number') {
            salt = genSaltSync(salt);
        }
        if (typeof salt !== 'string') {
            throw new Error("salt must be a salt string or a number of rounds");
        }

        if (salt.length !== 29 || salt.charAt(0) !== '$' || salt.charAt(3) !== '$' || salt.charAt(6) !== '$') {
            throw new Error("Invalid salt format");
        }

        let version = salt.substring(1,3);
        if (version !== "2a" && version !== "2b" && version !== "2y") { // Allow common versions
            throw new Error("Invalid salt version");
        }

        let rounds = parseInt(salt.substring(4, 6));
        if (isNaN(rounds) || rounds < MIN_ROUNDS || rounds > MAX_ROUNDS) {
            throw new Error("Invalid number of rounds in salt");
        }
        
        // Decode salt (last 22 characters)
        let real_salt_b64 = salt.substring(salt.lastIndexOf('$') + 1);
        let real_salt = decode_base64(real_salt_b64, SALT_LEN);
        if (real_salt.length < SALT_LEN) { // Ensure it decoded to the full length
             throw Error("Salt decoding failed: expected "+SALT_LEN+" bytes, got "+real_salt.length);
        }

        let hashed = crypt_raw(s, real_salt, rounds);
        let res = "$2a$"; // Store with a common prefix
        if (rounds < 10) res += "0";
        res += rounds.toString() + "$";
        res += encode_base64(hashed.split('').map(c=>c.charCodeAt(0)), hashed.length);
        return res;
    }

    /**
     * Compares a password to a hash synchronously.
     * @param {string} s Password to compare
     * @param {string} hash Hash to compare to
     * @returns {boolean} true if passwords match, false otherwise
     * @throws {Error} If password or hash is not a string or if hash is not a valid hash
     */
    export function compareSync(s, hash) {
        if (typeof s !== 'string' || typeof hash !== 'string') {
            throw Error("password and hash must be strings");
        }
        if (hash.length < 29) { // Basic check for a valid hash structure
            return false; // Not a valid hash
        }
        let salt = hash.substring(0, hash.lastIndexOf('$') + BCRYPT_SALT_LEN + 1 -SALT_LEN); // Extract the full salt part e.g. $2a$10$abcdefghijklmnopqrstu
        if (salt.length !== 29 || salt.charAt(0) !== '$' || salt.charAt(3) !== '$' || salt.charAt(6) !== '$') {
            return false; // Invalid salt format within hash
        }
        let hnew = hashSync(s, salt);
        if (hnew.length !== hash.length) return false;
        // Constant time comparison to prevent timing attacks
        let diff = 0;
        for (let i = 0; i < hash.length; i++) {
            diff |= hash.charCodeAt(i) ^ hnew.charCodeAt(i);
        }
        return diff === 0;
    }

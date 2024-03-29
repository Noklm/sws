'use strict';

export class NumericalHashCode {

	private hashes = new Map<number, string>();
	private inverseHashes = new Map<string, number>();

	public hash(s: string): number {

		if (this.inverseHashes.has(s)) {
			return this.inverseHashes.get(s)!;
		}


		/* Java odd-shift object hash (more or less at least) */
		/* TODO: change for something common? Need only to translate strings to numbers without colliding */
		let hash = Math.abs(s.split('').reduce(function (a, b) {
				a = ((a << 5) - a) + b.charCodeAt(0);
				return a & a;
			}, 0));

		this.hashes.set(hash, s);
		this.inverseHashes.set(s,hash);

		return hash;
	}

	public retrieve(n: number|string): string|number|null {
		if (typeof n === 'number' && this.hashes.has(n)) {
			return this.hashes.get(n) as string;
		}
		if (typeof n === 'string' && this.inverseHashes.has(n)) {
			return this.inverseHashes.get(n) as number;
		}

		return null;
	}
}
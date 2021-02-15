import fs = require('fs');
import sax = require('sax');
const parser = sax.parser(true, { trim: true });
const fifo: any = [{}];

parser.ontext = function (text: string) {
    if (text.length > 0) {
        this.tag.attributes["text"] = text;
    }
};

parser.onopentag = function (node: sax.Tag) {
    if (Object.keys(node.attributes).length === 0) {
        fifo.unshift([]);
    } else {
        fifo.unshift(node.attributes);
    }
};

parser.onclosetag = function (tag: string) {
    const child = fifo.shift();
    if (Array.isArray(fifo[0])) {
        fifo[0].push(child);
    } else {
        if (fifo[0][tag]) {
            if (Array.isArray(fifo[0][tag])) {
                fifo[0][tag].push(child);
            } else {
                const tmp: any = fifo[0][tag];
                fifo[0][tag] = [tmp, child];
            }
        } else {
            fifo[0][tag] = child;
        }

    }
};
parser.onattribute = function (attr: { name: string, value: string | number }) {
    const tmp = +attr.value;
    if (!isNaN(tmp)) {
        attr.value = tmp;
    }
    this.tag.attributes[attr.name] = attr.value;
};

export async function parse(atdfPath: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        const atdf_string = fs.readFileSync(atdfPath, {
            encoding: 'ascii'
        });

        parser.onend = function () {
            resolve(fifo.shift());
            fifo.push({});
        };

        parser.onerror = function (err: Error) {
            reject(err);
        };

        parser.write(atdf_string).close();
    });
}

/**
 * Created by Florin on 4/6/2017.
 */

export function getTextContent(root, tag) {
    const nodes = root.getElementsByTagName(tag);
    if (nodes && nodes.length) {
        return nodes[0].textContent.trim();
    }
    return '';
}

export function queryBtTag(node, tag, ns) {
    let collection;
    if (ns) {
        collection = node.getElementsByTagNameNS(ns, tag);
    }
    else {
        collection = node.getElementsByTagName(tag);
    }
    if (collection && collection.length) {
        return [].slice.call(collection);
    }
    return [];
}
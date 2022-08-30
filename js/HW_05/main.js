class Render {
    startRender(data, parent, root) {
        for (const prop in data) {
            if (typeof data[prop] === 'object') {
                if (Array.isArray(data[prop])) {
                    this.startRender(data[prop], parent);
                } else {
                    let currentElem = this.createElement(data[prop]);
                    parent ? parent.append(currentElem) : root.append(currentElem);
                    this.startRender(data[prop], currentElem);
                }
            }
        }
    }

    createElement(currentElem) {
        switch (currentElem.tag) {
            case 'IMG':
                return this.createImg(currentElem);
            case 'A':
                return this.createLinkTag(currentElem);
            case 'INPUT':
                return this.createInput(currentElem);
            case 'AUDIO':
                return this.createAudio(currentElem);
            default:
                return this.createSimpleTag(currentElem);
        }
    }

    createElemWithClassId(currentElem) {
        let newElem = document.createElement(currentElem.tag);
        if (currentElem.elem) {
            newElem.classList.add(...currentElem.elem.split(' '));
        }
        if (currentElem.id) {
            newElem.id = currentElem.id;
        }
        return newElem;
    }

    createImg(currentElem) {
        let newElem = this.createElemWithClassId(currentElem);
        newElem.src = currentElem.src;
        newElem.draggable = false;
        return newElem;
    }

    createLinkTag(currentElem) {
        let newElem = this.createElemWithClassId(currentElem);
        newElem.href = currentElem.href;
        if (currentElem.text) {
            newElem.innerHTML = currentElem.text;
        }
        return newElem;
    }

    createSimpleTag(currentElem) {
        let newElem = this.createElemWithClassId(currentElem);
        if (currentElem.text) {
            newElem.innerHTML = currentElem.text;
        }
        if (currentElem.type) {
            newElem.type = currentElem.type;
        }
        return newElem;
    }

    createInput(currentElem) {
        let newElem = this.createElemWithClassId(currentElem);
        newElem.type = currentElem.type;
        if (currentElem.placeholder) {
            newElem.placeholder = currentElem.placeholder;
        }
        if (currentElem.name) {
            newElem.name = currentElem.name;
        }
        return newElem;
    }

    createAudio(currentElem) {
        let newElem = this.createElemWithClassId(currentElem);
        newElem.setAttribute('controls', 'controls');
        return newElem;
    }
}

let homeRender = new Render();

function createObjWithClassId(currentDomEl) {
    let domElemObj = {};
    domElemObj.tag = currentDomEl.tagName;
    domElemObj.elem = currentDomEl.className;
    if (currentDomEl.id) {
        domElemObj.id = currentDomEl.id;
    }
    return domElemObj;
}

function createImgObj(currentDomEl) {
    let domElemObj = createObjWithClassId(currentDomEl);
    domElemObj.src = currentDomEl.src.replace('file:///D:/js%20learning/epam/epam_lab/', '');
    return domElemObj;
}

function createLinkObj(currentDomEl) {
    let domElemObj = createObjWithClassId(currentDomEl);
    domElemObj.href = currentDomEl.href;
    if (currentDomEl.hasAttribute('data-formatted_text')) {
        domElemObj.text = currentDomEl.innerHTML;
    }
    return domElemObj;
}

function createInputObj(currentDomEl) {
    let domElemObj = createObjWithClassId(currentDomEl);
    domElemObj.type = currentDomEl.type;
    if (currentDomEl.name) {
        domElemObj.name = currentDomEl.name;
    }
    if (currentDomEl.placeholder) {
        domElemObj.placeholder = currentDomEl.placeholder;
    }
    return domElemObj;
}

function createAudioObj(currentDomEl) {
    let domElemObj = createObjWithClassId(currentDomEl);
    domElemObj.audio = 'controls';
    return domElemObj;
}

function createCommonTagObj(currentDomEl) {
    let domElemObj = createObjWithClassId(currentDomEl);
    if (currentDomEl.type) {
        domElemObj.type = currentDomEl.type;
    }
    if (currentDomEl.hasAttribute('data-formatted_text')) {
        domElemObj.text = currentDomEl.innerHTML;
    }
    return domElemObj;
}

function addElement(currentDomEl) {
    switch (currentDomEl.tagName) {
        case 'IMG':
            return createImgObj(currentDomEl);
        case 'A':
            return createLinkObj(currentDomEl);
        case 'INPUT':
            return createInputObj(currentDomEl);
        case 'AUDIO':
            return createAudioObj(currentDomEl);
        default:
            return createCommonTagObj(currentDomEl);
    }
}

function parseHtml(root, parent) {
    const domElements = root.children;
    [].forEach.call(domElements, function (currentDomEl) {
        let domElemObj = addElement(currentDomEl);
        if (currentDomEl.firstElementChild) {
            domElemObj.content = [];
        } else {
            if (currentDomEl.hasAttribute('data-formatted_tag')) {
                return;
            }
            if (currentDomEl.innerText) {
                domElemObj.text = currentDomEl.innerText;
            }
        }
        parent ? parent.content.push(domElemObj) : parseData.push(domElemObj);
        parseHtml(currentDomEl, domElemObj);
    });
}

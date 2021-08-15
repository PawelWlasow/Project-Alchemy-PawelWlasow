let bank = document.getElementById ('bankOfElements');
let field = document.getElementById ('workField');
let DragManager = new function() {
  let dragObject = {};
  let self = this;
  function onClick(ev) {
    if (ev.which != 1) return;
    let elem = ev.target.closest('.base');
    if (!elem) return;
    if (elem.parentNode.id = 'bankOfElements') {}
    let copy = document.createElement ('img');
    copy.classList.add ('draggable');
    copy.setAttribute ('id', elem.id + 'ID');
    copy.setAttribute ('title', elem.title);
    copy.setAttribute ('alt', elem.id);
    copy.setAttribute ('src', 'icons/' + elem.id + '.png');
    field.appendChild (copy);
    dragObject.downX = ev.pageX;
    dragObject.downY = ev.pageY;
    return false;
  }
  function onMouseDown(e) {
    if (e.which != 1) return;
    let elem = e.target.closest('.draggable');
    if (!elem) return;
    dragObject.elem = elem;
    // запомним, что элемент нажат на текущих координатах pageX/pageY
    dragObject.downX = e.pageX;
    dragObject.downY = e.pageY;
    return false;
  }

  function onMouseMove(e) {
    if (!dragObject.elem) return; // элемент не зажат
    if (!dragObject.avatar) { // если перенос не начат...
      let moveX = e.pageX - dragObject.downX;
      let moveY = e.pageY - dragObject.downY;
      // если мышь передвинулась в нажатом состоянии недостаточно далеко
      if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) {
        return;
      }
      // начинаем перенос
      dragObject.avatar = createAvatar(e); // создать аватар
      if (!dragObject.avatar) { // отмена переноса, нельзя "захватить" за эту часть элемента
        dragObject = {};
        return;
      }
      // аватар создан успешно
      // создать вспомогательные свойства shiftX/shiftY
      let coords = getCoords(dragObject.avatar);
      dragObject.shiftX = dragObject.downX - coords.left;
      dragObject.shiftY = dragObject.downY - coords.top;
      startDrag(e); // отобразить начало переноса
    }
    // отобразить перенос объекта при каждом движении мыши
    dragObject.avatar.style.left = e.pageX - dragObject.shiftX + 'px';
    dragObject.avatar.style.top = e.pageY - dragObject.shiftY + 'px';
    return false;
  }

  function onMouseUp(e) {
    if (dragObject.avatar) { // если перенос идет
      finishDrag(e);
    }
    // перенос либо не начинался, либо завершился
    // в любом случае очистим "состояние переноса" dragObject
    dragObject = {};
  }

  function finishDrag(e) {
    let dropElem = findDroppable(e);
    if (!dropElem) {
      self.onDragCancel(dragObject);
    } else {
      self.onDragEnd(dragObject, dropElem);
      self.transformEl (dragObject);
    }
  }

  function createAvatar(e) {
    // запомнить старые свойства, чтобы вернуться к ним при отмене переноса
    let avatar = dragObject.elem;
    let old = {
      parent: avatar.parentNode,
      nextSibling: avatar.nextSibling,
      position: avatar.position || '',
      left: avatar.left || '',
      top: avatar.top || '',
      zIndex: avatar.zIndex || ''
    };
    // функция для отмены переноса
    avatar.rollback = function() {
      old.parent.insertBefore(avatar, old.nextSibling);
      avatar.style.position = old.position;
      avatar.style.left = old.left;
      avatar.style.top = old.top;
      avatar.style.zIndex = old.zIndex;
    };
    return avatar;
  }

  function startDrag(e) {
    let avatar = dragObject.avatar;
    // инициировать начало переноса
    document.body.appendChild(avatar);
    avatar.style.zIndex = 10;
    avatar.style.position = 'absolute';
  }

  function findDroppable(event) {
    dragObject.avatar.hidden = true;
    // получить самый вложенный элемент под курсором мыши
    let elem = document.elementFromPoint(event.clientX, event.clientY);
    dragObject.avatar.hidden = false;
    if (elem == null) {
      // такое возможно, если курсор мыши "вылетел" за границу окна
      return null;
    } else {
      return elem.closest('.droppable') || elem.closest('.fieldForTransform');
    }
  }
  document.onmousemove = onMouseMove;
  document.onmouseup = onMouseUp;
  document.onmousedown = onMouseDown;
  document.onclick = onClick;
  this.onDragEnd = function(dragObject, dropElem) {};
  this.onDragCancel = function(dragObject) {};
  this.transformEl = function(dragObject) {};
};
function getCoords(elem) {
  let box = elem.getBoundingClientRect();
  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset
  };
}
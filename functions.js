
function forEach(a,b){for(var i=0;i<a.length;i++)b(i,a[i])}
function makeElem(a){var b=document.createElement('div');return b.innerHTML=a,b.firstChild}
function hasClass(a,b){var c=new RegExp("(^|\\s+)"+b+"(\\s+|$)");return a?c.test(a.className):void 0}
function addClass(a,b){hasClass(a,b)||(a.className=a.className+" "+b);return a}
function removeClass(a,b){var c=new RegExp("(^|\\s+)"+b+"(\\s+|$)");a.className=a.className.replace(c,"");return a}
function toggleClass(a,b){var c=hasClass(a,b)?removeClass:addClass;c(a,b);return a}
function Ajax(a){var c={d:a.method||"get",e:a.url,f:a.data||"",g:a.callback||null},d=new XMLHttpRequest,e=function(){4==d.readyState&&c.g&&c.g(d.responseText)};"POST"==c.d.toUpperCase()?(d.open("POST",c.e,!0),d.setRequestHeader("Content-type","application/x-www-form-urlencoded"),d.onreadystatechange=e,d.send(c.f)):(d.open("GET",c.e+"?"+c.f,!0),d.onreadystatechange=e,d.send(null))}

function Todolist () {
  var self = this,
    list_tmpl = [
      '<div class="list-wrapper">',
        '<div class="list-container">',
          '<ul class="list">',
            '<li class="list-header" style="background-color:#{{color}}">',
              '<h1 contenteditable="false" spellcheck="false">{{title}}</h1>',
              '<a href="#" class="delete-list"></a>',
              '<a href="#" class="edit-list"></a>',
            '</li>',
            '<li class="list-settings">',
              '<textarea class="list-color" cols="7" title="List color">{{color}}</textarea>',
              '<a href="#" class="move-list-right" title="Move list right"></a>',
              '<a href="#" class="move-list-left" title="Move list left"></a>',
            '</li>',
            '{{items}}',
            '<li class="list-input">',
              '<div class="add-item"></div>',
              '<textarea placeholder="Add Item"></textarea>',
            '</li>',
          '</ul>',
        '</div>',
      '</div>'].join(''),
    item_tmpl = [
      '<li class="list-item">',
        '<h2 class="item-title">{{title}}</h2>',
        '<div class="descr"><p contenteditable="true" spellcheck="false" title="Click to edit">{{notes}}</p></div>',
        '<a href="#" class="checkbox {{completed}}" title="Mark/Unmark"></a>',
        '<div class="edit-item">',
          '<a href="#" class="move-item-up" title="Move item up"></a>',
          '<a href="#" class="move-item-down" title="Move item down"></a>',
          '<a href="#" class="delete-item" title="Delete item"></a>',
        '</div>',
      '</li>'].join(''),
    get = function(p,e){var l=p!='item';return hasClass(e,l?'list-wrapper':'list-item')?e:get(p,e.parentNode)},
    watch_title = function(e){e.which===13&&edit_toggle.call(this,e);(this.innerText.length==18&&e.which!=8)&&e.preventDefault()},
    change_color = function (e) {
      var ch = String.fromCharCode(e.keyCode),
        allowed = "0123456789ABCDEF".indexOf(ch.toUpperCase()) != -1,
        header = get('list', this).querySelector('.list-header'),
        hex = this.value, h = hex.split(''),
        pad = function(s){return s.length!=6?pad(s+'0'):s},
        getContrast = function (a) {
          var b = parseInt(a.substr(0,2),16),
            c = parseInt(a.substr(2,2),16),
            d = parseInt(a.substr(4,2),16),
            e = (299*b+587*c+114*d)/1e3;
          return e>=150?"#000":"#fff";
        };
      if (e.which == 13) {
        e.preventDefault();
        if (hex.length < 6) {
          if (hex.length != 3) this.value = hex = pad(hex);
          else hex = h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; // this is ugly
        } else if (hex.length > 6) { this.value = ''; return false }
        header.style.color = getContrast(hex);
        header.style.backgroundColor = '#' + hex;
      } else if ((!allowed || hex.length == 6) && e.which != 8) {
        e.preventDefault();
      }
    },
    edit_toggle = function (e) {
      var list = get('list', this),
        list_title = list.querySelector('.list-header h1'),
        editing = list_title.contentEditable == 'true';
      e.preventDefault();
      toggleClass(list,'editing');
      list_title.contentEditable = editing?'false':'true';
    },
    descr_toggle = function () {
      var item = toggleClass(this.parentNode, 'open'),
        item_descr = item.querySelector('.descr'),
        item_height = this.offsetHeight + item_descr.offsetHeight;
      item.style.height = item.offsetHeight + 'px';
      item.offsetHeight // force repaint
      item.style.transition = 'height 200ms';
      if (hasClass(item, 'open')) {
        item.style.height = Math.max(item_height, 210) + 'px';
        setTimeout(function () { 
          item.style.minHeight = '210px';
          item_descr.style.position = 'static' 
        }, 200);
      } else { 
        item.style.minHeight = '';
        item_descr.style.position = 'absolute';
        item.style.height = this.offsetHeight + 'px';
      }
      setTimeout(function () { 
        item.style.transition = '';
        item.style.height = '';
      }, 200);
    },
    add_item = function (e) {
      var new_item, new_item_html;
      if (e.which == 13) {
        e.preventDefault();
        if (this.value.trim().length) {
          new_item_html = item_tmpl.replace('{{title}}', this.value.trim());
          new_item_html = new_item_html.replace('{{completed}}', '');
          new_item_html = new_item_html.replace('{{notes}}', '');
          new_item = makeElem(new_item_html);
          get('list', this).querySelector('.list').insertBefore(new_item, this.parentNode);
          this.value = '';
        }
      }
    },
    create_list = function (i, o) {
      var new_list, new_list_html = list_tmpl, items_html = '';
      new_list_html = new_list_html.replace('{{title}}', o.title);
      new_list_html = new_list_html.replace(/{{color}}/g, o.settings.color);
      forEach(o.items, function (i, item) {
        var new_item_html = item_tmpl;
        new_item_html = new_item_html.replace('{{title}}', item.title);
        new_item_html = new_item_html.replace('{{completed}}', item.completed?'checked':'');
        new_item_html = new_item_html.replace('{{notes}}', item.notes);
        items_html = items_html + new_item_html;
      });
      new_list_html = new_list_html.replace('{{items}}', items_html);
      new_list = makeElem(new_list_html);
      document.querySelector('.main-container').appendChild(new_list);
    },
    del = function (p) {
      var el = get(p, this);
      if (p == 'list') {
        el.style.transition = 'opacity 200ms, top 200ms, width 300ms 200ms';
        el.style.top = '-500px';
        el.style.width = '0px';
        el.style.opacity = 0;
      } else {
        el.style.height = el.offsetHeight + 'px';
        el.style.minHeight = '';
        el.offsetHeight // force repaint
        el.style.transition = 'height 200ms';
        el.style.height = '0px';
      }
      setTimeout(function(){el.parentNode.removeChild(el)},200);
    },
    arrange = function (str) {
      // Managed to combine FOUR functions here
      // to be more DRY... sh*t gets complicated
      var s = str.split(" "), l = s[0]=='list',
        el = get(s[0], this), p = s[1]=='prev',
        x_el = p?el.previousElementSibling:el.nextElementSibling,
        el_size, x_el_size, anim = l?'left':'top';
      if (!hasClass(x_el,l?'list-wrapper':'list-item')) return false;
      el_size = l?el.offsetWidth:el.offsetHeight;
      x_el_size = l?x_el.offsetWidth:x_el.offsetHeight;
      el.style.transition = anim + ' 200ms';
      x_el.style.transition = anim + ' 200ms';
      el.style[anim] = (p?'-':'') + x_el_size + 'px';
      x_el.style[anim] = (p?'':'-') + el_size + 'px';
      setTimeout(function () {
        el.parentNode.insertBefore(p?el:x_el, p?x_el:el);
        x_el.style.transition = '';
        el.style.transition = '';
        x_el.style[anim] = '';
        el.style[anim] = '';
      }, 200)
    },
    deligatedEvents = function (e) {
      var t = e.target,
        callEvent = function(a,b){e.preventDefault(),a.call(e.target,b)};
      if (hasClass(t,'checkbox')) {e.preventDefault(),toggleClass(e.target,'checked')}
      if (hasClass(t,'item-title')) callEvent(descr_toggle);
      if (hasClass(t,'delete-item')) callEvent(del, 'item');
      if (hasClass(t,'delete-list')) callEvent(del, 'list');
      if (hasClass(t,'move-item-up')) callEvent(arrange,'item prev');
      if (hasClass(t,'move-item-down')) callEvent(arrange,'item next');
      if (hasClass(t,'move-list-left')) callEvent(arrange,'list prev');
      if (hasClass(t,'move-list-right')) callEvent(arrange,'list next');
      if (hasClass(t,'add-item')) t.parentNode.querySelector('textarea').focus();
    },
    request_json = function (c) {
      var a,x=new XMLHttpRequest,f=function(){4==x.readyState&&c(JSON.parse(x.responseText))};
      x.open("GET","todo.json",true),x.onreadystatechange=f,x.send(null)
    },
    get_scrollbar_size = function(){var b,a=document.createElement("div"),c=document.body;return a.style.overflow="scroll",a.style.position="absolute",c.appendChild(a),b=a.offsetWidth,c.removeChild(a),b},
    addListeners = function () {
      forEach(document.querySelectorAll('.list-wrapper'), function (i, list) {
        list.querySelector('.list-container').style.padding = '0 ' + Math.ceil(get_scrollbar_size()/2) + 'px';
        list.querySelector('.list-input textarea').addEventListener('keydown', add_item);
        list.querySelector('.list-header h1').addEventListener('keydown', watch_title);
        list.querySelector('.list-color').addEventListener('keypress', change_color);
        list.querySelector('.edit-list').addEventListener('click', edit_toggle);
        list.addEventListener('click', deligatedEvents);
      });
    };
  self.init = function () {
    document.querySelector('.main-wrapper').style.bottom = '-' + get_scrollbar_size() + 'px';
    request_json(function (arr) {
      forEach(arr, create_list);
      addListeners();
    });
    return self;
  };
};
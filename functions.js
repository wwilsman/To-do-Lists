function forEach(a,b){for(var i=0;i<a.length;i++)b(i,a[i])}
function makeElem(a){var b=document.createElement('div');return b.innerHTML=a,b.firstChild}
function hasClass(a,b){var c=new RegExp("(^|\\s+)"+b+"(\\s+|$)");return a?c.test(a.className):void 0}
function addClass(a,b){hasClass(a,b)||(a.className=a.className+" "+b);return a}
function removeClass(a,b){var c=new RegExp("(^|\\s+)"+b+"(\\s+|$)");a.className=a.className.replace(c," ");return a}
function toggleClass(a,b){var c=hasClass(a,b)?removeClass:addClass;c(a,b);return a}

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
              '<div class="list-input-textarea" contenteditable="true" spellcheck="false"></div>',
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
    scrollbar_size = (function(){var b,a=document.createElement("div"),c=document.body;return a.style.overflow="scroll",a.style.position="absolute",c.appendChild(a),b=a.offsetWidth,c.removeChild(a),b}()),
    is_mobile_layout = function(){return window.innerWidth<600},
    get = function(p,e){var l=p!='item';return hasClass(e,l?'list-wrapper':'list-item')?e:get(p,e.parentNode)},
    carousel = {
      set_active: function (list) {
        var active_lists = document.querySelectorAll('.active-list');
        addClass(list, 'active-list');
        if (active_lists.length) {
          forEach(active_lists, function (i, l) {
            removeClass(l, 'active-list');
          });
        }
      },
      slide_to: function (l) {
        var main_cont = l.parentNode,
          all_lists_arr = Array.prototype.slice.call(main_cont.children),
          lp = l.offsetWidth, li = all_lists_arr.indexOf(l);
        main_cont.style.left = '-' + lp * li + 'px';
        this.set_active(l);
        setTimeout(update_data, 200);
      }
    },
    watch_title = function (e) {
      if (this.innerText.length==18&&e.which!=8) e.preventDefault();
      if (e.which === 13) {update_data(),edit_toggle.call(this,e)}
    },
    adj_cont_width = function () {
      var main_cont = document.querySelector('.main-container'),
        first_child = addClass(main_cont.firstElementChild, 'active-list'),
        total_width = 0, list_width = first_child.offsetWidth;
      main_cont.style.transition = 'width 200ms';
      main_cont.offsetWidth // force repaint
      if(is_mobile_layout()) {
        total_width = main_cont.children.length;
        main_cont.style.width = total_width * 100 + '%';
        main_cont.style.padding = '';
        forEach(main_cont.children, function (i, l) {
          var li = l.querySelector('.list');
          li&&(li.style.margin = '0 -' + Math.ceil(scrollbar_size / 2) + 'px');
          l.style.width = 100 / total_width + '%';
        });
      } else {
        main_cont.style.padding = '0 ' + (window.innerWidth - list_width) / 2 + 'px';
        forEach(main_cont.children, function (i, l) {
          var li = l.querySelector('.list');
          total_width += list_width;
          li&&(li.style.margin = '');
          l.style.width = '';
        });
        main_cont.style.width = total_width + 'px';
      }
      setTimeout(function(){main_cont.style.transition=''},200)
    },
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
      if (e.which == 13 || e.type == 'blur') {
        e.preventDefault();
        if (hex.length < 6 && hex.length != 3) this.value = hex = pad(hex);
        else if (hex.length > 6) { this.value = ''; return false }
        header.style.color = getContrast(hex);
        header.style.backgroundColor = '#' + hex;
        setTimeout(update_data, 200);
      } else if ((!allowed || hex.length == 6) && e.which != 8) {
        e.preventDefault();
      }
    },
    edit_toggle = function () {
      var list = get('list', this),
        list_title = list.querySelector('.list-header h1'),
        editing = list_title.contentEditable == 'true';
      toggleClass(list,'editing');
      list_title.contentEditable = editing?'false':'true';
    },
    descr_toggle = function () {
      var item = this.parentNode,
        item_descr = item.querySelector('.descr'),
        item_height = this.offsetHeight + item_descr.offsetHeight,
        aside_height = item.querySelector('.edit-item').offsetHeight;
      item.opening===undefined&&(item.opening = false);
      if (item.opening === false) {
        item.opening = true; toggleClass(item, 'open');
        item.style.height = item.offsetHeight + 'px';
        item.offsetHeight // force repaint
        item.style.transition = 'height 200ms';
        if (hasClass(item, 'open')) {
          item.style.height = Math.max(item_height, aside_height) + 'px';
          setTimeout(function () { 
            item.style.minHeight = aside_height + 'px';
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
          item.opening = false;
        }, 200);
      }
    },
    add_item = function (e) {
      var new_item, new_item_html;
      if (e.which == 13) {
        e.preventDefault();
        if (this.innerText.trim().length) {
          new_item_html = item_tmpl.replace('{{title}}', this.innerText.trim());
          new_item_html = new_item_html.replace('{{completed}}', '');
          new_item_html = new_item_html.replace('{{notes}}', '');
          new_item = makeElem(new_item_html);
          get('list', this).querySelector('.list').insertBefore(new_item, this.parentNode);
          this.innerText = '';
          update_data();
        }
      }
    },
    create_list = function (i, o, r) {
      var new_list, new_list_html = list_tmpl, items_html = '',
        list_container = document.querySelector('.main-container'),
        add_list_el = list_container.querySelector('.add-list-wrapper');
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
      add_list_el.style.transition = 'left 200ms';
      add_list_el.style.left = add_list_el.offsetWidth + 'px';
      setTimeout(function () {
        add_list_el.style.transition = '';
        new_list.style.opacity = 0;
        new_list.style.transition = 'opacity 400ms';
        list_container.insertBefore(new_list, add_list_el);
        new_list.offsetWidth // force repaint
        new_list.style.opacity = '';
        add_list_el.style.left = '';
        setTimeout(function () {
          new_list.style.transition = '';
          update_data();
        }, 400);
        addListeners(null, new_list);
        adj_cont_width();
      }, 200)
      return r?new_list:void 0;
    },
    delete_list = function () {
      var el = get('list', this),
        alert = makeElem([
          '<li class="alert">',
            '<h2>Delete this list?</h2>',
            '<a href="#" class="alert-yes"></a>',
            '<a href="#" class="alert-no"></a>',
          '</li>'
        ].join('')),
        confirm = function (e) {
          e.preventDefault();
          addClass(el.nextElementSibling, 'active-list');
          el.style.transition = 'opacity 200ms, top 200ms, width 200ms 200ms';
          el.style.top = '-500px';
          el.style.width = '0px';
          el.style.opacity = 0;
          setTimeout(function () {
            el.parentNode.removeChild(el)
            adj_cont_width();
            update_data();
          }, 400);
        },
        cancel = function (e) {
          e.preventDefault();
          alert.style.height = '0px';
          setTimeout(function () {
            el.querySelector('.list').removeChild(alert);
          }, 200);
        };
      el.querySelector('.list').appendChild(alert);
      alert.querySelector('.alert-yes').addEventListener('click', confirm);
      alert.querySelector('.alert-no').addEventListener('click', cancel);
      alert.offsetHeight // force repaint
      alert.style.height = '3.5em';
    }
    delete_item = function () {
      var el = get('item', this);
      el.style.height = el.offsetHeight + 'px';
      el.style.minHeight = '';
      el.offsetHeight // force repaint
      el.style.transition = 'height 200ms';
      el.style.height = '0px';
      setTimeout(function(){
        el.parentNode.removeChild(el)
        update_data();
      }, 200);
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
      el.style.zIndex = 1000;
      setTimeout(function () {
        el.parentNode.insertBefore(p?el:x_el, p?x_el:el);
        l&&carousel.slide_to(el);
        x_el.style.transition = '';
        el.style.transition = '';
        x_el.style[anim] = '';
        el.style[anim] = '';
        el.style.zIndex = '';
        update_data();
      }, 200)
    },
    deligatedEvents = function (e) {
      var t = e.target,
        check_toggle = function(){toggleClass(e.target,'checked'),update_data()},
        callEvent = function(a,b){e.preventDefault(),a.call(e.target,b)};
      if (!hasClass(get('list', t), 'active-list')) {
        carousel.slide_to(get('list', t));
        return false;
      }
      if (hasClass(t,'checkbox')) callEvent(check_toggle);
      if (hasClass(t,'item-title')) callEvent(descr_toggle);
      if (hasClass(t,'edit-list')) callEvent(edit_toggle);
      if (hasClass(t,'delete-item')) callEvent(delete_item);
      if (hasClass(t,'delete-list')) callEvent(delete_list);
      if (hasClass(t,'move-item-up')) callEvent(arrange,'item prev');
      if (hasClass(t,'move-item-down')) callEvent(arrange,'item next');
      if (hasClass(t,'move-list-left')) callEvent(arrange,'list prev');
      if (hasClass(t,'move-list-right')) callEvent(arrange,'list next');
      if (hasClass(t,'add-item')) t.parentNode.querySelector('textarea').focus();
    },
    request_data = function (c) {
      var data = localStorage.getItem("TodoData");
      data&&c(JSON.parse(data));
    },
    update_data = function () {
      var lists = [];
      forEach(document.querySelectorAll('.list'), function (i, lis) {
        var list = {
          "title": lis.querySelector('.list-header h1').innerText,
          "settings": {
            "color": lis.querySelector('.list-color').value
          },
          "items": []
        };
        forEach(lis.querySelectorAll('.list-item'), function (i, li) {
          list.items.push({
            "title": li.querySelector('h2').innerText,
            "completed": hasClass(li.querySelector('.checkbox'), 'checked'),
            "notes": li.querySelector('.descr p').innerText
          });
        });
        lists.push(list);
      });
      localStorage.setItem("TodoData", JSON.stringify(lists));
    },
    addListeners = function (i, list) {
      list.querySelector('.list-container').style.padding = '0 ' + Math.ceil(scrollbar_size / 2) + 'px';
      list.querySelector('.list-input-textarea').addEventListener('keydown', add_item);
      list.querySelector('.list-header h1').addEventListener('keydown', watch_title);
      list.querySelector('.list-color').addEventListener('keypress', change_color);
      list.querySelector('.list-color').addEventListener('blur', change_color);
      list.addEventListener('click', deligatedEvents);
      forEach(list.querySelectorAll('.descr p'), function (i, descr) {
        descr.addEventListener('blur', update_data);
      });
    },
    add_list = function () {
      var new_list_obj = {"title":"","settings":{"color":"0CF"},"items":[]},
        new_list = create_list(null, new_list_obj, true),
        new_title = new_list.querySelector('.list-header h1');
      edit_toggle.call(new_list);
      carousel.slide_to(new_list);
      setTimeout(function(){
        new_title.focus();
        update_data();
      },200);
    };

  self.init = function () {
    document.querySelector('.add-list-wrapper').addEventListener('click', function (e) {
      e.preventDefault();hasClass(this,'active-list')?add_list():carousel.slide_to(this);
    });
    window.addEventListener('resize',adj_cont_width);
    request_data(function(a){forEach(a,create_list)});
    carousel.set_active(document.querySelector('.main-container').firstElementChild);
    adj_cont_width();
    return self;
  };
};
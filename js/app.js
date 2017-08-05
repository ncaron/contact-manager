var Contacts = {
  $section: $('#contacts'),
  id: 1,
  list: [],
  add: function(contact) {
    this.list.push(contact);
    this.id += 1;
    this.render(this.list)
  },
  render: function() {
    this.$section.html('');

    if (this.list.length === 0) {
      this.$section.html(App.errorTemplate({error: 'No Contacts.'}));
    } else {
      this.$section.html(App.contactTemplate({contact: this.list}));
    }
  },
  init: function() {
    this.render();
  }
};

var Form = {
  $section: $('#add-new'),
  toggle: function() {
    this.$section.slideToggle();
    Contacts.$section.slideToggle();

    $('input').val('');
  },
  getData: function() {
    return {
      id: Contacts.id,
      name: $('#name').val(),
      email: $('#email').val(),
      phone: $('#phone').val(),
    };
  },
  handleSubmit: function() {
    Contacts.add(this.getData());
    this.toggle();
  }
};


var App = {
  cacheTemplates: function() {
    var errorTemplate = $('#contact-error').remove().html();
    var contactTemplate = $('#contact').remove().html();

    this.errorTemplate = Handlebars.compile(errorTemplate);
    this.contactTemplate = Handlebars.compile(contactTemplate);
  },
  bindEvents: function() {
    $(document).on('click', 'a', function(e) {
      e.preventDefault();

      var targetID = e.target.id;

      switch (targetID) {
        case 'add-contact':
          Form.toggle();
          break;
        case 'cancel-add':
          Form.toggle();
          break;
        case 'submit':
          Form.handleSubmit();
          break;
      }
    });
  },
  init: function() {
    this.cacheTemplates();
    this.bindEvents();
    Contacts.init();
  }
};

App.init();
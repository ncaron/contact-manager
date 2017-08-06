var Contacts = {
  $section: $('#contacts'),
  id: '0',
  currentContact: {},
  editing: false,
  add: function(contact) {
    contact.id = this.id;
    this.id = String(Number(this.id + 1));
    this.list.push(contact);
    this.render(this.list);
  },
  edit: function() {
    var $contactDiv = this.$section.find('[data-id="' + this.currentContact.id + '"]');
    var editedContact = Form.getData();
    var index = this.getIndex(this.currentContact.id);
    editedContact.id = this.currentContact.id;
    this.list[index] = editedContact;

    $contactDiv.find('[data-field="name"]').text(editedContact.name);
    $contactDiv.find('[data-field="email"]').text(editedContact.email);
    $contactDiv.find('[data-field="phone"]').text(editedContact.phone);
  },
  handleEdit: function($currentContact) {
    this.currentContact.id = String($currentContact.data('id'));
    this.currentContact.name = $currentContact.find('[data-field="name"]').text();
    this.currentContact.email = $currentContact.find('[data-field="email"]').text();
    this.currentContact.phone = $currentContact.find('[data-field="phone"]').text();

    this.resetConfirmation();
    Form.toggle();
    Form.setData(this.currentContact);
    this.editing = true;
  },
  diplayConfirmation: function($currentContact) {
    this.resetConfirmation();

    $currentContact.find('.confirm').animate({
      opacity: 1,
    }, 400);

    $currentContact.find('.edit-delete').fadeOut();
    $currentContact.find('.yes-no').fadeIn();
  },
  getIndex: function(id) {
    return this.list.indexOf(this.list.find(function(contact) {
      return contact.id === id;
    }));
  },
  delete: function($currentContact) {
    var index = this.getIndex(String($currentContact.data('id')));

    $currentContact.fadeOut(400, function() {
      $currentContact.remove();
    });

    this.list.splice(index, 1);
    localStorage.setItem('list', JSON.stringify(Contacts.list));

    if (this.list.length === 0) {
      this.render();
    }
  },
  resetConfirmation: function() {
    $('.confirm').animate({
      opacity: 0,
    }, 100);

    $('.edit-delete').fadeIn();
    $('.yes-no').fadeOut();
  },
  render: function() {
    this.$section.html('');

    if (this.list.length === 0) {
      this.$section.html(App.errorTemplate({error: 'No Contacts.'}));
    } else {
      this.$section.html(App.contactTemplate({contact: this.list}));
    }
  },
  bindEvents: function() {
    var self = this;

    this.$section.on('click', 'button', function(e) {
      e.preventDefault();

      var targetID = $(e.target).data('button');
      var $currentContact = $(e.target.closest('.contact'));

      if (targetID === 'edit') {
        self.handleEdit($currentContact);
      } else if (targetID === 'delete') {
        self.diplayConfirmation($currentContact);
      } else if (targetID === 'no') {
        self.resetConfirmation();
      } else if (targetID === 'yes') {
        self.delete($currentContact);
      }
    });
  },
  init: function() {
    this.list = JSON.parse(localStorage.getItem('list')) || [];
    this.bindEvents();
    this.render();
  }
};

var Form = {
  $form: $('form'),
  $formError: $('#form-error'),
  $section: $('#add-new'),
  toggle: function() {
    this.$section.slideToggle();
    Contacts.$section.slideToggle();
    this.$form.trigger('reset');
  },
  getData: function() {
    return {
      name: $('#name').val(),
      email: $('#email').val(),
      phone: $('#phone').val(),
    };
  },
  setData: function(currentContact) {
    $('#name').val(currentContact.name);
    $('#email').val(currentContact.email);
    $('#phone').val(currentContact.phone);
  },
  validateInput: function(input) {
    var $errorBox = $(input).parent().find('.error');
    var inputID = input.id;
    var validity = input.validity;
    var error = '';

    if (!validity.valid) {
      input.classList.add('invalid');

      if (validity.valueMissing) {
        error = 'This is a required field.'
      } else {
        if (inputID === 'name') {
          error = 'Name may only contain letters, spaces and apostrophes.'
        } else if (inputID === 'email') {
          error = 'Please enter a valid email address.'
        } else if (inputID === 'phone') {
          error = 'Phone Number may only contain numbers, dashes, pluses, spaces and parentheses.'
        }
      }

      $errorBox.text(error);
      return false;
    } else {
      input.classList.remove('invalid');
      $errorBox.text('');
      return true;
    }
  },
  validateForm: function() {
    var self = this;
    var isValid = true;

    this.$form.find('input').each(function() {
      if (!self.validateInput(this)) {
        isValid = false;
      }
    });

    return isValid;
  },
  handleSubmit: function() {
    var data = this.getData();

    if (this.validateForm()) {
      if (Contacts.editing) {
        Contacts.edit();
      } else {
        Contacts.add(data);
      }

      localStorage.setItem('list', JSON.stringify(Contacts.list));
      this.toggle();
    } else {
      this.$formError.animate({
        opacity: 1,
      }, 400);
    }
  },
  resetForm: function() {
    this.$form.find('input').removeClass('invalid');
    this.$form.find('.error').text('');

    this.$formError.animate({
      opacity: 0,
    }, 400);
  },
  preventInvalidKeys: function(e) {
    var target = e.target;
    var key = e.key;

    if (target.id === 'name' && !key.match(/[a-z' ]/i) ||
        target.id === 'phone' && !key.match(/[0-9()+\- ]/)) {
      e.preventDefault();
    }
  },
  bindEvents: function() {
    this.$form.on('input', function(e) {
      this.validateInput(e.target);
    }.bind(this));

    this.$form.on('keypress', 'input', this.preventInvalidKeys.bind(this));
    this.$form.on('reset', this.resetForm.bind(this));

    this.$form.on('click', 'button', function(e) {
      e.preventDefault();

      var targetID = $(e.target).data('button');

      if (targetID === 'submit') {
        this.handleSubmit();
      } else if (targetID === 'cancel-add') {
        this.toggle();
      }
    }.bind(this));
  },
  init: function() {
    this.bindEvents();
  },
};

var App = {
  cacheTemplates: function() {
    var errorTemplate = $('#contact-error').remove().html();
    var contactTemplate = $('#contact').remove().html();

    this.errorTemplate = Handlebars.compile(errorTemplate);
    this.contactTemplate = Handlebars.compile(contactTemplate);
  },
  bindEvents: function() {
    $(document).on('click', function(e) {
      e.preventDefault();

      var targetID = $(e.target).data('button');

      if (e.target.tagName !== 'BUTTON') {
        Contacts.resetConfirmation();
      } else if (targetID === 'add-contact') {
        Contacts.editing = false;
        Form.toggle();
      }
    });
  },
  init: function() {
    this.cacheTemplates();
    this.bindEvents();
    Contacts.init();
    Form.init();
  }
};

App.init();
var Contacts = {
  $section: $('#contacts'),
  currentContact: {},
  filteredList: [],
  editing: false,

  // Will add a contact to the array of contacts(list) using the data provided
  add: function(contact) {
    this.list.push(contact);
    this.render(this.list);
  },

  /*
  * Finds the div of the contact being edited using the contact's ID
  * Gets the index of the contact being edited using getIndex()
  * Gets the form's data. Getting the data assigns a new ID to the contact
  * Replaces the new ID with the old one to keep it consistent
  * Replaces the old contact object in the array of contacts(list) with the new one
  */
  edit: function() {
    var $contactDiv = this.$section.find('[data-id="' + this.currentContact.id + '"]');
    var index = this.getIndex(this.currentContact.id);
    var editedContact = Form.getData();
    editedContact.id = this.currentContact.id;
    this.list[index] = editedContact;
    this.render(this.list);
  },

  /*
  * Sets the data of the current contact being edited
  * Sets editing to true so that when submit is clicked, the appropriate behavior will happen
  */
  handleEdit: function($currentContact) {
    this.currentContact.id = String($currentContact.data('id'));
    this.currentContact.name = $currentContact.find('.contact-name').text();
    this.currentContact.email = $currentContact.find('.contact-email').text();
    this.currentContact.phone = $currentContact.find('.contact-phone').text();
    this.currentContact.tags = $.map($currentContact.find('.tag'), function(tag) {
      return $(tag).text();
    }).join(' ');

    this.resetConfirmation();
    Form.toggle();
    Form.setData(this.currentContact);
    this.editing = true;
  },

  // Shows the delete confirmation while hiding the 'Edit' and 'Delete' buttons
  diplayConfirmation: function($currentContact) {
    this.resetConfirmation();

    $currentContact.find('.confirm').animate({
      opacity: 1,
    }, 400);

    $currentContact.find('.edit-delete').fadeOut();
    $currentContact.find('.yes-no').fadeIn();
  },

  // Using the id of the contact, find its position in the array of contacts(list)
  getIndex: function(id) {
    return this.list.indexOf(this.list.find(function(contact) {
      return contact.id === id;
    }));
  },

  /*
  * Find the index of the contact to be deleted using getIndex()
  * fadeOut the contact that will be deleted
  * Splice the array of contacts(list) to remove the deleted contact
  * Updated the localStorage list of contacts
  * Re-render the page if the array of contacts is empty, this will display the error message.
  */
  delete: function($currentContact) {
    var index = this.getIndex(String($currentContact.data('id')));

    $currentContact.fadeOut(400, function() {
      $currentContact.remove();
    });

    this.list.splice(index, 1);
    localStorage.setItem('list', JSON.stringify(Contacts.list));

    if (this.list.length === 0) {
      this.render(this.list);
    }
  },

  // Removes the delete confirmation while displaying the 'Edit' and 'Delete' buttons
  resetConfirmation: function() {
    $('.confirm').animate({
      opacity: 0,
    }, 100);

    $('.edit-delete').fadeIn();
    $('.yes-no').fadeOut();
  },

  // Sets the search box to the value of the clicked tag
  handleTagClick: function(tag) {
    $('#search').val(tag);
    this.filter();
  },

  // Checks the search input VS contact data and re-renders the page based on the result
  filter: function() {
    var search = $('#search').val().toLowerCase();

    this.filteredList = this.list.filter(function(contact) {
      return contact.name.toLowerCase().indexOf(search) >= 0 ||
             contact.email.toLowerCase().indexOf(search) >= 0 ||
             contact.phone.indexOf(search) >= 0 ||
             contact.tags.indexOf(search) >= 0;
    });

    this.render(this.filteredList);
  },

  // Displays an error message if there's no contacts found else display the list of contacts
  render: function(list) {
    this.$section.html('');

    if (list.length === 0) {
      this.$section.html(App.errorTemplate({error: 'No Contacts.'}));
    } else {
      this.$section.html(App.contactTemplate({contact: list}));
    }
  },
  bindEvents: function() {
    var self = this;

    this.$section.on('click', '.contact', function(e) {
      e.preventDefault();

      var $target = $(e.target);
      var $currentContact = $(e.target.closest('.contact'));

      if ($target.hasClass('edit-contact')) {
        self.handleEdit($currentContact);
      } else if ($target.hasClass('delete-contact')) {
        self.diplayConfirmation($currentContact);
      } else if ($target.hasClass('no')) {
        self.resetConfirmation();
      } else if ($target.hasClass('yes')) {
        self.delete($currentContact);
      } else if ($target.hasClass('tag')) {
        self.handleTagClick($target.text());
      }
    });
  },

  // Initializes the Contacts object and sets the list using localStorage
  init: function() {
    this.list = JSON.parse(localStorage.getItem('list')) || [];
    this.bindEvents();
    this.render(this.list);
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

  /*
  * Generates a random 10 digit id for the contact, id will be a String
  * Checks if the random id already exists, recursively recall the function if it does
  */
  generateID: function() {
    var id = '';
    var ids;
    var i;

    for (i = 0; i < 10; i += 1) {
      id += String(Math.floor(Math.random() * 9));
    }

    ids = Contacts.list.map(function(contact) {
      return contact.id;
    });

    if (ids.indexOf(id) >= 0) {
      return this.generateID();
    }

    return id;
  },

  // Gets the forms data and returns an object representing the contact
  getData: function() {
    return {
      id: this.generateID(),
      name: $('#name').val(),
      email: $('#email').val(),
      phone: $('#phone').val(),
      tags: $('#tags').val().trim().split(' ').map(function(tag) {
        return tag.toLowerCase();
      }),
    };
  },

  // When the 'Edit' button is clicked, sets the form's data to match the contact to be edited
  setData: function(currentContact) {
    $('#name').val(currentContact.name);
    $('#email').val(currentContact.email);
    $('#phone').val(currentContact.phone);
    $('#tags').val(currentContact.tags);
  },

  /*
  * Checks if the input to be checked is valid, adds 'invalid' class if not valid and return false
  * Based on what is wrong(required or invalid format), displays the appropriate error message
  * Remove the 'invalid' class if valid and return true
  */
  validateInput: function(input) {
    var $errorBox = $(input).parent().find('.error');
    var inputID = input.id;
    var inputLength = input.value.split(' ').length;
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
    } else if (inputID === 'tags' && inputLength > 5) {
      input.classList.add('invalid');
      $errorBox.text('Please only use 5 tags or less.');
      return false;
    } else {
      input.classList.remove('invalid');
      $errorBox.text('');
      return true;
    }
  },

  // Loops through all form inputs and sets 'isValid' to false if any of them are not valid
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

  /*
  * If the form is valid, checks 'editing' property of the Contacts object to get the appropriate behavior
  * Update localStorage with the new contact data
  * Displays the form error message if the form is not valid
  */
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

  // Resets all form data, error message and 'invalid' classes
  resetForm: function() {
    this.$form.find('input').removeClass('invalid');
    this.$form.find('.error').text('');

    this.$formError.animate({
      opacity: 0,
    }, 400);
  },

  /*
  * Prevents invalid keys from being entered by the user
  * For name, prevents keys that are not letters, apostrophes or spaces
  * For phone, prevents the keys that are not numbers, parentheses, pluses, dashes or spaces
  * Also limits the tags to 5
  */
  preventInvalidInputs: function(e) {
    var target = e.target;
    var key = e.key;
    var wordCount = target.value.trim().split(' ').length;

    if (target.id === 'name' && !key.match(/[a-z' ]/i) ||
        target.id === 'phone' && !key.match(/[0-9()+\- ]/) ||
        target.id === 'tags' && wordCount >= 5 && key === ' ') {
      e.preventDefault();
    }
  },
  bindEvents: function() {
    this.$form.on('input', function(e) {
      this.validateInput(e.target);
    }.bind(this));

    this.$form.on('keypress', 'input', this.preventInvalidInputs.bind(this));
    this.$form.on('reset', this.resetForm.bind(this));

    this.$form.on('click', 'button', function(e) {
      e.preventDefault();

      var $target = $(e.target);

      if ($target.hasClass('submit')) {
        this.handleSubmit();
      } else if ($target.hasClass('cancel-add')) {
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

      var $target = $(e.target);

      if (e.target.tagName !== 'BUTTON') {
        Contacts.resetConfirmation();
      } else if ($target.hasClass('add-contact')) {
        Contacts.editing = false;
        Form.toggle();
      } else if ($target.hasClass('reset')) {
        $('#search').val('');
        Contacts.filter();
      }
    });

    $('#search').on('input', Contacts.filter.bind(Contacts));
  },

  /*
  * Initializes the whole app
  * Registers a custom 'if' helper to check if tags are present
  */
  init: function() {
    Handlebars.registerHelper('if', function(tags, options) {
      if (tags.join(' ').length > 0) {
        return options.fn(this)
      }
    });

    this.cacheTemplates();
    this.bindEvents();
    Contacts.init();
    Form.init();
  }
};

App.init();
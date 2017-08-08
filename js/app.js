var Contacts = {
  $section: $('#contacts'),
  currentContact: {},
  editing: false,

  // Will add a contact to the array of contacts(list) using the data provided
  add: function(contact) {
    this.list.push(contact);
    this.$section.append(App.contactTemplate(contact));
    $('.no-contacts').hide();

    if (this.list.length > 0) {
      App.toggleSearch(false, 'Search');
    }
  },

  // Edits the current contact with the new form data
  edit: function() {
    var editedContact = Form.getData();
    this.currentContact.name = editedContact.name;
    this.currentContact.email = editedContact.email;
    this.currentContact.phone = editedContact.phone;
    this.currentContact.tags = editedContact.tags;
    this.render();
  },

  /*
  * Finds which contact will be edited based on the id of the element
  * Sets editing to true so that when submit is clicked, the appropriate behavior will happen
  */
  handleEdit: function($currentContact) {
    var contactID = String($currentContact.data('id'));
    this.currentContact = $.grep(this.list, function(contact) {
      return contact.id === contactID;
    }.bind(this))[0];

    this.hideVisibleConfirmation();
    Form.toggle();
    Form.setData(this.currentContact);
    this.editing = true;
  },
  confirmDeletion: function($currentContact) {
    this.hideVisibleConfirmation();
    this.hideEditAndDeleteButtons($currentContact);
    this.showDeleteConfirmation($currentContact);
  },
  hideVisibleConfirmation: function() {
    $('.confirm').animate({
      opacity: 0,
    }, 400);
  },
  hideEditAndDeleteButtons: function($currentContact) {
    $currentContact.find('.edit-delete').fadeOut();
  },
  showDeleteConfirmation: function($currentContact) {
    $currentContact.find('.confirm').animate({
      opacity: 1,
    }, 400);

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
  * Updates the localStorage list of contacts
  * Displays an error if no more contacts are left in the list
  */
  delete: function($currentContact) {
    var index = this.getIndex(String($currentContact.data('id')));

    $currentContact.fadeOut(400, function() {
      $currentContact.remove();

      if (this.list.length !== 0) {
        this.filter();
      }
    }.bind(this));

    this.list.splice(index, 1);
    localStorage.setItem('list', JSON.stringify(Contacts.list));

    if (this.list.length === 0) {
      $('.no-contacts').html('No Contacts').fadeIn(400);
      App.toggleSearch(true, 'No contacts to search');
    }
  },

  // Removes the delete confirmation while displaying the 'Edit' and 'Delete' buttons
  hideVisibleConfirmation: function() {
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

  /*
  * Checks the search input VS contact data and toggles the visibilty based on the result
  * Displays an error message if no matches found
  */
  filter: function() {
    var search = $('#search').val().toLowerCase();

    $('.contact').each(function() {
      $(this).toggle($(this).find('.contact-name').text().toLowerCase().indexOf(search) >= 0 ||
                     $(this).find('.contact-email').text().toLowerCase().indexOf(search) >= 0 ||
                     $(this).find('.contact-phone').text().indexOf(search) >= 0 ||
                     $(this).find('.tag').text().indexOf(search) >= 0);
    });

    if ($('.contact:visible').length === 0) {
      this.$section.find('.no-contacts').html('No Contacts starting with: ' + search);
      this.$section.find('.no-contacts').show();
    } else {
      this.$section.find('.no-contacts').hide();
    }
  },

  /*
  * Renders the 'no-contacts' error div, hides it if the list is not empty
  * Renders the list of contacts
  */
  render: function() {
    this.$section.html('');

    this.$section.append(App.errorTemplate({error: 'No Contacts.'}));
    this.$section.append(App.contactListTemplate({contact: this.list}));

    if (this.list.length !== 0) {
      this.$section.find('.no-contacts').hide();
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
        self.confirmDeletion($currentContact);
      } else if ($target.hasClass('no')) {
        self.hideVisibleConfirmation();
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
    this.render();

    if (this.list.length === 0) {
      App.toggleSearch(true, 'No contacts to search');
    }
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

    this.$form.on('keypress', 'input', function(e) {
      if (e.key === 'Enter') {
        $('.submit').trigger('click');
      } else {
        this.preventInvalidInputs(e);
      }
    }.bind(this));

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
    var contactListTemplate = $('#contact-list').remove().html();
    var contactTemplate = $('#contact-template').remove().html();
    var contactTemplatePartial = Handlebars.registerPartial('contact-template', contactTemplate);

    this.errorTemplate = Handlebars.compile(errorTemplate);
    this.contactTemplate = Handlebars.compile(contactTemplate);
    this.contactListTemplate = Handlebars.compile(contactListTemplate);
  },

  /*
  * Disables or enables the search bar and reset button based on the value passed in
  */
  toggleSearch: function(disabled, message) {
    $('#search').val('');
    $('#search').prop('disabled', disabled);
    $('#search').prop('placeholder', message);
    $('.reset').prop('disabled', disabled)
  },
  bindEvents: function() {
    $(document).on('click', function(e) {
      var $target = $(e.target);

      if (e.target.id !== 'github') {
        e.preventDefault();
      }

      if (e.target.tagName !== 'BUTTON') {
        Contacts.hideVisibleConfirmation();
      } else if ($target.hasClass('add-contact')) {
        Contacts.editing = false;
        Form.toggle();
      } else if ($target.hasClass('reset')) {
        $('#search').val('');
        Contacts.filter();
      }
    });

    $('#search').on('input', Contacts.filter.bind(Contacts));

    $('#search').on('keypress', function(e) {
      if (e.key === 'Enter') {
        $('#search').blur();
      }
    })
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
var ERRORS = {
  required: 'This is a required field.',
  name: 'Name may only contain letters, spaces and apostrophes.',
  email: 'Please enter a valid email address.',
  phone: 'Phone Number may only contain numbers, dashes, pluses, spaces and parentheses.',
  tags: 'Please only use 5 tags or less.',
  noContacts: 'No contacts',
  noMatch: 'No contacts matching: ',
};

var Contacts = {
  $contactsSection: $('#contacts'),
  $searchBar: $('#search'),
  editingContact: false,
  handleNewContactClick: function() {
    this.editingContact = false;
    this.contactsToggle();
    Form.formToggle();
  },
  handleAddContact: function() {
    var contact = Form.getFormData();
    contact.id = this.generateRandomID();

    this.addContactToList(contact);
    this.addContactToUI(contact);
    this.hideContactError();
    this.contactsToggle();
    this.enableOrDisableSearch();
  },
  addContactToList: function(contact) {
    this.list.push(contact);
    this.saveContactsToStorage();
  },
  addContactToUI: function(contact) {
    this.$contactsSection.append(this.contactTemplate(contact));
  },
  handleEditContactClick: function() {
    this.editingContact = true;
    Form.setFormData(this.currentContactObj);
    Form.formToggle();
    this.contactsToggle();
  },
  handleEditContact: function() {
    this.editContactList();
    this.editContactUI();
  },
  editContactList: function() {
    var newContactData = Form.getFormData();

    this.currentContactObj.name = newContactData.name;
    this.currentContactObj.email = newContactData.email;
    this.currentContactObj.phone = newContactData.phone;
    this.currentContactObj.tags = newContactData.tags;
    this.contactsToggle();
    this.saveContactsToStorage();
  },
  editContactUI: function() {
    this.toggleTagView();
    this.$currentContactDiv.find('.contact-name').text(this.currentContactObj.name);
    this.$currentContactDiv.find('.contact-email').text(this.currentContactObj.email);
    this.$currentContactDiv.find('.contact-phone').text(this.currentContactObj.phone);
    this.$currentContactDiv.find('.contact-tags').text(this.currentContactObj.tags);
    this.$currentContactDiv.find('.tags').html(this.tagsTemplate({tags:this.currentContactObj.tags}));
  },
  toggleTagView: function() {
    if (this.currentContactObj.tags[0] === '') {
      this.$currentContactDiv.find('.tags').hide();
    } else {
      this.$currentContactDiv.find('.tags').show();
    }
  },
  handleDeleteClick: function() {
    this.hideEditAndDeleteButtons();
    this.showDeleteConfirmation();
  },
  deleteContact: function() {
    this.removeContactFromUI();
    this.removeContactFromList();
    this.enableOrDisableSearch();

    if (this.list.length === 0) {
      this.showContactError(ERRORS.noContacts);
    }
  },
  removeContactFromUI: function() {
    this.$currentContactDiv.fadeOut(400, function() {
      $(this).remove();
    });
  },
  removeContactFromList: function() {
    this.list.splice(this.currentContactIndex, 1);
    this.saveContactsToStorage();
  },
  handleHideDelete: function() {
    this.hideDeleteConfirmation();
    this.showEditAndDeleteButtons();
  },
  showEditAndDeleteButtons: function() {
    this.$contactsSection.find('.edit-delete').fadeIn();
  },
  hideEditAndDeleteButtons: function() {
    this.$currentContactDiv.find('.edit-delete').fadeOut();
  },
  showDeleteConfirmation: function() {
    this.$currentContactDiv.find('.confirm').animate({ opacity: 1 }, 400);
    this.$currentContactDiv.find('.yes-no').fadeIn();
  },
  hideDeleteConfirmation: function() {
    this.$contactsSection.find('.confirm').animate({ opacity: 0 }, 400);
    this.$contactsSection.find('.yes-no').fadeOut();
  },
  getContactIndex: function() {
    return this.list.indexOf(this.list.find(function(contact) {
      return contact.id === this.$currentContactDiv.data('id').toString();
    }.bind(this)));
  },
  generateRandomID: function() {
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
      return this.generateRandomID();
    }

    return id;
  },
  contactsToggle: function() {
    this.$contactsSection.slideToggle();
  },
  render: function() {
    this.$contactsSection.append(this.contactListTemplate({contact: this.list}));

    if (this.list.length > 0) {
      this.hideContactError();
    }
  },
  hideContactError: function() {
    $('.no-contacts').hide();
  },
  showContactError: function(error) {
    $('.contact-error').text(error);
    $('.no-contacts').show();
  },
  getContactsFromStorage: function() {
    this.list = JSON.parse(localStorage.getItem('list')) || [];
  },
  saveContactsToStorage: function() {
    localStorage.setItem('list', JSON.stringify(this.list));
  },
  handleFiltering: function() {
    var searchTerm = this.$searchBar.val().toLowerCase();
    this.getFilteredContacts(searchTerm);
    this.toggleFilteredContacts();

    if (this.filteredIDs.length === 0) {
      this.showContactError(ERRORS.noMatch + searchTerm);
    } else {
      this.hideContactError();
    }
  },
  getFilteredContacts: function(searchTerm) {
    this.filteredIDs = this.list.filter(function(contact) {
      if (contact.name.toLowerCase().indexOf(searchTerm) >= 0 ||
          contact.email.toLowerCase().indexOf(searchTerm) >= 0 ||
          contact.phone.indexOf(searchTerm) >= 0 ||
          contact.tags.indexOf(searchTerm) >= 0) {
        return contact;
      }
    }).map(function(contact) { return Number(contact.id) });
  },
  toggleFilteredContacts: function() {
    var self = this;

    $('.contact').each(function() {
      $(this).toggle(self.filteredIDs.indexOf($(this).data('id')) >= 0);
    });
  },
  handleTagClick: function(tag) {
    this.setSearchBarText(tag.text());
    this.handleFiltering();
  },
  setSearchBarText: function(tag) {
    this.$searchBar.val(tag);
  },
  resetSearchBar: function() {
    this.$searchBar.val('');
    this.handleFiltering();
  },
  enableOrDisableSearch: function() {
    if (this.list.length === 0) {
      this.toggleSearchBar(true, 'No contacts to search.');
    } else {
      this.toggleSearchBar(false, 'Search');
    }
  },
  toggleSearchBar: function(disabled, message) {
    this.resetSearchBar();
    this.$searchBar.prop('placeholder', message);
    this.$searchBar.prop('disabled', disabled);
    $('.reset').prop('disabled', disabled);
  },
  bindContactsEvents: function() {
    $('.add-contact').on('click', this.handleNewContactClick.bind(this));
    $('.reset').on('click', this.resetSearchBar.bind(this));
    this.$searchBar.on('input', this.handleFiltering.bind(this));

    this.$contactsSection.on('click', '.contact', function(e) {
      var $target = $(e.target);
      
      if (e.target.tagName === 'BUTTON') {
        this.$currentContactDiv = $target.closest('.contact');
        this.currentContactIndex = this.getContactIndex();
        this.currentContactObj = this.list[this.currentContactIndex];
      }

      if ($target.hasClass('delete-contact')) {
        this.handleDeleteClick();
      } else if ($target.hasClass('yes')) {
        this.deleteContact();
      } else if ($target.hasClass('edit-contact')) {
        this.handleEditContactClick();
      } else if ($target.hasClass('tag')) {
        this.handleTagClick($target);
      }
    }.bind(this));
  },
  cacheContactTemplates: function() {
    var contactListTemplate = $('#contact-list').remove().html();
    var contactTemplate = $('#contact-template').remove().html();
    var tagsTemplate = $('#tags-template').remove().html();
    var contactTemplatePartial = Handlebars.registerPartial('contact-template', contactTemplate);
    var tagsTemplatePartial = Handlebars.registerPartial('tags-template', tagsTemplate);

    this.contactTemplate = Handlebars.compile(contactTemplate);
    this.contactListTemplate = Handlebars.compile(contactListTemplate);
    this.tagsTemplate = Handlebars.compile(tagsTemplate);
  },
  registerContactHelpers: function() {
    Handlebars.registerHelper('if', function(tags, options) {
      if (tags.join(' ').length > 0) {
        return options.fn(this);
      }
    });
  },
  init: function() {
    this.cacheContactTemplates();
    this.registerContactHelpers();
    this.bindContactsEvents();
    this.getContactsFromStorage();
    this.enableOrDisableSearch();
    this.render();
  }
};

var Form = {
  $formSection: $('#form-section'),
  $form: $('form'),
  handleSubmit: function() {
    this.validateForm();

    if (!this.validForm) {
      $('#form-error').animate({ opacity: 1 }, 250);
    } else {
      if (Contacts.editingContact) {
        Contacts.handleEditContact();
      } else {
        Contacts.handleAddContact();
      }

      this.resetForm();
    }
  },
  formToggle: function() {
    this.$formSection.slideToggle();
  },
  resetForm: function() {
    this.$form.trigger('reset');
    this.formToggle();
    this.$formSection.find('input').removeClass('invalid');
    this.$formSection.find('.error').animate({ opacity: 0 }, 250);
    $('#form-error').animate({ opacity: 0 }, 250);
  },
  getFormData: function() {
    return {
      name: $('#name').val(),
      email: $('#email').val(),
      phone: $('#phone').val(),
      tags: $('#tags').val().trim().split(' ').map(function(tag) {
        return tag.toLowerCase();
      }),
    };
  },
  setFormData: function(contact) {
    $('#name').val(contact.name);
    $('#email').val(contact.email);
    $('#phone').val(contact.phone);
    $('#tags').val(contact.tags.join(' '));
  },
  validateForm: function() {
    var self = this;
    this.validForm = true;

    this.$form.find('input').each(function() {
      if (!self.validateInput(this)) {
        self.validForm = false;
      }
    });
  },
  validateInput: function(input) {
    var inputID = input.id;
    var inputLength = input.value.trim().split(' ').length;
    var inputValidity = input.validity;
    var error;

    if (!inputValidity.valid || (inputID === 'tags' && inputLength > 5)) {
      if (inputValidity.valueMissing) {
        error = ERRORS.required;
      } else {
        error = ERRORS[inputID];
      }

      this.displayInputError(input, error);
      isValid = false;
    } else {
      this.removeInputError(input);
      isValid = true;
    }

    return isValid;
  },
  displayInputError: function(input, error) {
    $(input).parent().find('.error').text(error).animate({ opacity : 1}, 250);
    $(input).addClass('invalid');
  },
  removeInputError: function(input) {
    $(input).parent().find('.error').animate({ opacity : 0}, 250);
    $(input).removeClass('invalid');
  },
  preventInvalidKeys: function(e) {
    var target = e.target;
    var key = e.key;
    var wordCount = target.value.trim().split(' ').length;

    if (target.id === 'name' && !key.match(/[a-z' ]/i) ||
        target.id === 'phone' && !key.match(/[0-9()+\- ]/) ||
        target.id === 'tags' && wordCount >= 5 && key === ' ') {
      e.preventDefault();
    }
  },
  bindFormEvents: function() {
    this.$formSection.on('click', 'button', function(e) {
      e.preventDefault();

      var $target = $(e.target);

      if ($target.hasClass('cancel-add')) {
        this.resetForm();
        Contacts.contactsToggle();
      } else if ($target.hasClass('submit')) {
        this.handleSubmit();
      }
    }.bind(this));

    this.$form.on('input', function(e) {
      this.validateInput(e.target);
    }.bind(this)).on('keypress', 'input', function(e) {
      this.preventInvalidKeys(e);
    }.bind(this)).on('blur', 'input', function(e) {
      this.validateInput(e.target);
    }.bind(this));
  },
  init: function() {
    this.bindFormEvents();
  }
};

var App = {
  bindEvents: function() {
    $(document).on('click', function(e) {
      if (!$(e.target).hasClass('delete-contact')) {
        Contacts.handleHideDelete();
      }
    });
  },
  init: function() {
    Contacts.init();
    Form.init();
    this.bindEvents();
  }
};

App.init();
var App = {
  $contactForm: $('#add-new'),
  $contactsSection: $('#contacts'),
  contacts: [],
  contactID: 1,
  cacheTemplates: function() {
    var errorTemplate = $('#contact-error').remove().html();
    var contactTemplate = $('#contact').remove().html();

    this.errorTemplate = Handlebars.compile(errorTemplate);
    this.contactTemplate = Handlebars.compile(contactTemplate);
  },
  renderContacts: function(contacts) {
    this.$contactsSection.html('');

    if (contacts.length === 0) {
      this.$contactsSection.append(this.errorTemplate({error: 'No Contacts.'}));
    } else {
      this.$contactsSection.append(this.contactTemplate({contact: this.contacts}));
    }
  },
  toggleForm: function() {
    this.$contactForm.slideToggle();
    this.$contactsSection.slideToggle();

    $('input').val('');
  },
  handleSubmit: function() {
    this.addContact(this.getData());
    this.toggleForm();
  },
  getData: function() {
    return {
      id: this.contactID,
      name: $('#name').val(),
      email: $('#email').val(),
      phone: $('#phone').val(),
    };
  },
  addContact: function(contact) {
    this.contacts.push(contact);
    this.contactID += 1;
    this.renderContacts(this.contacts)
  },
  bindEvents: function() {
    var self = this;

    $(document).on('click', 'a', function(e) {
      e.preventDefault();

      var targetID = e.target.id;

      switch (targetID) {
        case 'add-contact':
          self.toggleForm();
          break;
        case 'cancel-add':
          self.toggleForm();
          break;
        case 'submit':
          self.handleSubmit();
          break;
      }
    });
  },
  init: function() {
    this.cacheTemplates();
    this.bindEvents();
    this.renderContacts(this.contacts);
  }
};

App.init();
class ListComponent {
  createHtmlTag(state) {
    return `<ul> ${state.users.map(user => `<li>${user.name}</li>`).join('\n')}`;
  }

  render(state, selector = 'app') {
    const markup = this.createHtmlTag(state);
    const parent = document.getElementById(selector);
    parent.innerHTML = markup;
  }

  update(state) {
    this.render(state, 'user-list-container');
  }
}

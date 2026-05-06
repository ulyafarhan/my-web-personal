export class FormHelper {
  static getSelectedTags(form: HTMLFormElement) {
    return Array.from(form.querySelectorAll('input[name="tag_ids"]:checked') as NodeListOf<HTMLInputElement>)
      .map(input => {
        const span = input.nextElementSibling;
        return span ? span.textContent?.trim() || '' : '';
      }).filter(Boolean);
  }

  static getSelectedTagIds(form: HTMLFormElement) {
    return Array.from(form.querySelectorAll('input[name="tag_ids"]:checked') as NodeListOf<HTMLInputElement>)
      .map(input => input.value);
  }

  static makeSlug(value: string) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/&/g, ' dan ')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

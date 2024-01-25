import { ComboInput } from './ComboInput';

export class DataComboInput extends ComboInput {
  update(values: string[], data: string) {
    this.data = data;
    let client_data: object = this.client.data;
    for (const value of values) {
      client_data = client_data[value] || {};
    }
    this.values = client_data instanceof Array ? client_data : [];
  }
}

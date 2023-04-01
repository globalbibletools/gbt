import apiClient from '../../shared/apiClient';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import TextInput from '../../shared/components/TextInput';
import FormLabel from '../../shared/components/FormLabel';
import Button from '../../shared/components/Button';

export default function NewLanguageView() {
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = (
      e.currentTarget.elements.namedItem('code') as HTMLInputElement
    ).value;
    const name = (
      e.currentTarget.elements.namedItem('name') as HTMLInputElement
    ).value;
    await apiClient.languages.create({
      data: {
        type: 'language',
        id: code,
        attributes: {
          name,
        },
      },
    });

    navigate('/languages');
  }

  return (
    <View fitToScreen>
      <div className="m-auto w-fit">
        <ViewTitle>New Language</ViewTitle>

        <form onSubmit={onSubmit}>
          <div className="mb-2">
            <FormLabel htmlFor="code">CODE</FormLabel>
            <TextInput
              id="code"
              name="code"
              className="block"
              autoComplete="off"
            />
          </div>
          <div className="mb-4">
            <FormLabel htmlFor="name">NAME</FormLabel>
            <TextInput
              id="name"
              name="name"
              className="block"
              autoComplete="off"
            />
          </div>
          <div>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </div>
    </View>
  );
}

import apiClient from '../../shared/apiClient';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import { FormEvent } from 'react';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import TextInput from '../../shared/components/TextInput';
import FormLabel from '../../shared/components/FormLabel';
import Button from '../../shared/components/Button';
import { GetLanguageResponseBody } from '@translation/api-types';

export async function manageLanguageViewLoader({ params }: LoaderFunctionArgs) {
  return apiClient.languages.findByCode(params.code ?? 'unknown');
}

export default function ManageLanguageView() {
  const language = useLoaderData() as GetLanguageResponseBody;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = (
      e.currentTarget.elements.namedItem('name') as HTMLInputElement
    ).value;
    await apiClient.languages.update({
      data: {
        type: 'language',
        id: language.data.id,
        attributes: {
          name,
        },
      },
    });
  }

  return (
    <View fitToScreen>
      <div className="m-auto w-fit">
        <ViewTitle>{language.data.attributes.name}</ViewTitle>

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <FormLabel htmlFor="name">NAME</FormLabel>
            <TextInput
              id="name"
              name="name"
              className="block"
              autoComplete="off"
              defaultValue={language.data.attributes.name}
            />
          </div>
          <div>
            <Button type="submit">Update</Button>
          </div>
        </form>
      </div>
    </View>
  );
}

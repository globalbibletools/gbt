import apiClient from '../../shared/apiClient';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import { useLoaderData } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import TextInput from '../../shared/components/form/TextInput';
import FormLabel from '../../shared/components/form/FormLabel';
import {
  GetLanguageMembersResponseBody,
  GetLanguageResponseBody,
} from '@translation/api-types';
import { useTranslation } from 'react-i18next';
import Form from '../../shared/components/form/Form';
import InputError from '../../shared/components/form/InputError';
import { useFlash } from '../../shared/hooks/flash';
import SubmittingIndicator from '../../shared/components/form/SubmittingIndicator';
import Button from '../../shared/components/actions/Button';
import {
  List,
  ListBody,
  ListCell,
  ListHeader,
  ListHeaderCell,
  ListRow,
  ListRowAction,
} from '../../shared/components/List';
import { Link } from '../../shared/components/actions/Link';
import { Icon } from '../../shared/components/Icon';

export async function manageLanguageViewLoader(code: string) {
  const language = await apiClient.languages.findByCode(code);
  const members = await apiClient.languages.findMembers(code);
  return { language, members };
}

interface FormData {
  name: string;
}

export default function ManageLanguageView() {
  const { language, members } = useLoaderData() as {
    language: GetLanguageResponseBody;
    members: GetLanguageMembersResponseBody;
  };
  const flash = useFlash();

  const { t } = useTranslation(['translation', 'users']);

  const formContext = useForm<FormData>();
  async function onSubmit(data: FormData) {
    try {
      await apiClient.languages.update(language.data.code, {
        name: data.name,
      });
      flash.success(t('translation:language_updated'));
    } catch (error) {
      flash.error(`${error}`);
    }
  }

  return (
    <View fitToScreen className="flex justify-center items-start">
      <div className="mx-4 flex-shrink">
        <ViewTitle className="flex">
          <span>{language.data.name}</span>
          <span className="mx-2">-</span>
          <span>{language.data.code}</span>
        </ViewTitle>
        <Form context={formContext} onSubmit={onSubmit} className="mb-8">
          <div className="mb-2">
            <FormLabel htmlFor="name">
              {t('translation:name').toUpperCase()}
            </FormLabel>
            <TextInput
              id="name"
              name="name"
              className="w-full"
              autoComplete="off"
              defaultValue={language.data.name}
              required
              aria-describedby="name-error"
            />
            <InputError
              id="name-error"
              name="name"
              messages={{ required: t('translation:language_name_required') }}
            />
          </div>
          <div>
            <Button type="submit">{t('translation:update')}</Button>
            <SubmittingIndicator className="ms-3" />
          </div>
        </Form>
        <List className="mb-8">
          <ListHeader>
            <ListHeaderCell className="min-w-[120px]">
              {t('users:name').toUpperCase()}
            </ListHeaderCell>
            <ListHeaderCell className="min-w-[120px]">
              {t('users:email').toUpperCase()}
            </ListHeaderCell>
            <ListHeaderCell className="min-w-[120px]">
              {t('users:roles').toUpperCase()}
            </ListHeaderCell>
            <ListHeaderCell />
          </ListHeader>
          <ListRowAction colSpan={4}>
            <Link to="./invite">
              <Icon icon="plus" className="me-1" />
              {t('users:invite_user')}
            </Link>
          </ListRowAction>
          <ListBody>
            {members.data.map((member) => (
              <ListRow key={member.userId}>
                <ListCell header>{member.name}</ListCell>
                <ListCell>{member.email}</ListCell>
                <ListCell>
                  {member.roles
                    .map((role) =>
                      t('users:role', { context: role.toLowerCase() })
                    )
                    .join(', ')}
                </ListCell>
                <ListCell></ListCell>
              </ListRow>
            ))}
          </ListBody>
        </List>
        <div>
          <Link to="./import" variant="button">
            <Icon icon="file-import" className="me-4"></Icon>
            {t('import_glosses')}
          </Link>
        </div>
      </div>
    </View>
  );
}

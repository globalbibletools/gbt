import { useTranslation } from 'react-i18next';
import apiClient from '../../shared/apiClient';
import { Icon } from '../../shared/components/Icon';
import {
  List,
  ListBody,
  ListCell,
  ListHeader,
  ListHeaderCell,
  ListRow,
} from '../../shared/components/List';
import ViewTitle from '../../shared/components/ViewTitle';
import { useLoaderData } from 'react-router-dom';
import { GetLanguagesResponseBody } from '@translation/api-types';
import { capitalize } from '../../shared/utils';
import { useAccessControl } from '../../shared/accessControl';
import useTitle from '../../shared/hooks/useTitle';
import Button from '../../shared/components/actions/Button';
import CreateLanguageDialog, {
  CreateLanguageDialogRef,
} from './CreateLanguageDialog';
import { useRef } from 'react';
import queryClient from '../../shared/queryClient';
import { useQuery } from '@tanstack/react-query';

const languagesQueryKey = {
  queryKey: ['languages'],
  queryFn: () => apiClient.languages.findAll(),
};

export function languagesViewLoader() {
  return queryClient.ensureQueryData(languagesQueryKey);
}

function useLanguagesQuery() {
  const loaderData = useLoaderData() as Awaited<
    ReturnType<typeof languagesViewLoader>
  >;
  return useQuery({
    ...languagesQueryKey,
    initialData: loaderData,
  });
}

export default function LanguagesView() {
  const { t } = useTranslation(['languages', 'common']);
  useTitle(t('common:tab_titles.languages'));
  const userCan = useAccessControl();

  const { data: languages } = useLanguagesQuery();
  const createDialog = useRef<CreateLanguageDialogRef>(null);

  return (
    <div className="px-8 py-6 w-fit">
      <div className="flex items-baseline mb-4">
        <ViewTitle>
          {capitalize(t('languages:language', { count: 100 }))}
        </ViewTitle>
        <div className="flex-grow" />
        {userCan('create', 'Language') && (
          <Button
            onClick={() => createDialog.current?.showModal()}
            variant="primary"
          >
            <Icon icon="plus" className="me-1" />
            {t('languages:add_language')}
          </Button>
        )}
      </div>
      <CreateLanguageDialog ref={createDialog} />
      <List>
        <ListHeader>
          <ListHeaderCell className="min-w-[240px]">
            {t('languages:language', { count: 1 }).toUpperCase()}
          </ListHeaderCell>
          <ListHeaderCell />
        </ListHeader>
        <ListBody>
          {languages.data.map((language) => (
            <ListRow key={language.code}>
              <ListCell header>
                {language.name}
                <span className="text-sm ml-1 font-normal">
                  {language.code}
                </span>
              </ListCell>
              <ListCell>
                {userCan('administer', {
                  type: 'Language',
                  id: language.code,
                }) && (
                  <Button variant="tertiary" to={`./${language.code}`}>
                    {t('languages:manage')}
                  </Button>
                )}
              </ListCell>
            </ListRow>
          ))}
        </ListBody>
      </List>
    </div>
  );
}

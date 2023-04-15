import { useTranslation } from 'react-i18next';
import { Link } from '../../shared/components/Link';
import apiClient from '../../shared/apiClient';
import { Icon } from '../../shared/components/Icon';
import {
  List,
  ListBody,
  ListCell,
  ListHeader,
  ListHeaderCell,
  ListRow,
  ListRowAction,
} from '../../shared/components/List';
import View from '../../shared/components/View';
import ViewTitle from '../../shared/components/ViewTitle';
import { useLoaderData } from 'react-router-dom';
import { GetLanguagesResponseBody } from '@translation/api-types';
import { capitalize } from '../../shared/utils';

export function languagesViewLoader() {
  return apiClient.languages.findAll();
}

export default function LanguagesView() {
  const languages = useLoaderData() as GetLanguagesResponseBody;

  const { t } = useTranslation();

  return (
    <View fitToScreen>
      <div className="m-auto w-fit">
        <ViewTitle>{capitalize(t('language', { count: 100 }))}</ViewTitle>
        <List>
          <ListHeader>
            <ListHeaderCell className="min-w-[240px]">
              {t('language', { count: 1 }).toUpperCase()}
            </ListHeaderCell>
            <ListHeaderCell />
          </ListHeader>
          <ListRowAction colSpan={2}>
            <Link to="./new">
              <Icon icon="plus" className="mr-1" />
              {t('add_language')}
            </Link>
          </ListRowAction>
          <ListBody>
            {languages.data.map((language) => (
              <ListRow key={language.code}>
                <ListCell header>{language.name}</ListCell>
                <ListCell>
                  <Link to={`./${language.code}`}>{t('manage')}</Link>
                </ListCell>
              </ListRow>
            ))}
          </ListBody>
        </List>
      </div>
    </View>
  );
}

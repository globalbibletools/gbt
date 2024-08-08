import { useParams } from 'react-router-dom';
import ViewTitle from '../../shared/components/ViewTitle';
import apiClient from '../../shared/apiClient';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'lodash';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';

export default function ManageLanguageUserView() {
  const params = useParams() as { code: string };

  const { t } = useTranslation(['common', 'bible']);

  const { isLoading, data } = useQuery({
    queryKey: ['language-progress', params.code],
    queryFn({ queryKey }) {
      return apiClient.languages.findProgress(queryKey[1]);
    },
  });

  const [isDarkMode, setDarkMode] = useState(false);
  useEffect(() => {
    const mediaMatch = window.matchMedia('(prefers-color-scheme: dark)');
    mediaMatch.addEventListener('change', (event) => {
      setDarkMode(event.matches);
    });
    setDarkMode(mediaMatch.matches);
  }, []);

  const chartRoot = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (chartRoot.current && data) {
      const chart = new Chart(chartRoot.current, {
        type: 'bar',
        data: {
          labels: data.data.map((book) =>
            t(`bible:${book.name.toLowerCase()}`)
          ),
          datasets: [
            {
              label: 'Progress',
              data: data.data.map(
                (book) => (book.approvedCount / book.wordCount) * 100
              ),
              backgroundColor: isDarkMode ? '#59A8A2' : '#066F74',
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          indexAxis: 'y',
          scales: {
            x: {
              min: 0,
              max: 100,
            },
          },
          plugins: {
            legend: { display: false },
          },
        },
      });
      return () => chart.destroy();
    }
  }, [data, isDarkMode]);

  return (
    <div className="absolute w-full h-full px-8 py-6 overflow-y-auto">
      <ViewTitle className="mb-4">
        {capitalize(t('languages:reports') ?? '')}
      </ViewTitle>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="w-full h-[1200px] mb-6">
          <canvas ref={chartRoot} />
        </div>
      )}
    </div>
  );
}

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
              label: 'Approved',
              data: data.data.map((book) => book.approvedCount),
              backgroundColor: isDarkMode ? '#59A8A2' : '#066F74',
            },
            {
              label: 'Remaining',
              data: data.data.map(
                (book) => book.wordCount - book.approvedCount
              ),
              backgroundColor: isDarkMode ? '#4b5563' : '#d1d5db',
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          indexAxis: 'y',
          interaction: {
            mode: 'index',
          },
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
            },
          },
          plugins: {
            legend: { display: false },
          },
        },
      });
      return () => chart.destroy();
    }
  }, [data, isDarkMode, t]);

  return (
    <div className="absolute w-full h-full px-8 py-6 overflow-y-auto">
      <ViewTitle className="mb-4">
        {capitalize(t('languages:reports') ?? '')}
      </ViewTitle>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="w-full h-[1200px] mb-6">
          <h2 className="font-bold">Words Approved by Book</h2>
          <canvas ref={chartRoot} />
        </div>
      )}
    </div>
  );
}

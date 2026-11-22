import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { byGeneration, searchPeople } from '../data/people';
import { useT } from '../i18n';
import { TopBar } from '../ui/components';
import { PersonRow } from '../ui/PersonRow';
import { FamilyGate } from './useFamilyGate';

export function PeopleScreen() {
  const t = useT();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  return (
    <FamilyGate title={t('people')}>
      {({ people, isAdmin }) => {
        const count = Object.keys(people).length;
        const results = query.trim() ? searchPeople(people, query) : null;
        return (
          <main className="screen">
            <TopBar
              title={t('people')}
              right={
                isAdmin ? (
                  <button
                    className="icon-btn"
                    aria-label={t('addPerson')}
                    data-testid="add-person"
                    onClick={() => navigate('/add')}
                  >
                    ➕
                  </button>
                ) : undefined
              }
            />
            {count === 0 ? (
              <div className="center grow">
                <div className="muted">{t('emptyFamily')}</div>
                {isAdmin && (
                  <button className="btn" onClick={() => navigate('/add?first=1')}>
                    ➕ {t('addFirst')}
                  </button>
                )}
              </div>
            ) : (
              <>
                <input
                  className="text-input search"
                  type="search"
                  value={query}
                  placeholder={t('search')}
                  onChange={(e) => setQuery(e.target.value)}
                  data-testid="search"
                />
                {results ? (
                  <div className="list">
                    {results.length === 0 && <div className="muted center">{t('noResults')}</div>}
                    {results.map((id) => (
                      <PersonRow
                        key={id}
                        id={id}
                        person={people[id]}
                        label={
                          people[id].generation
                            ? t('generation', { n: people[id].generation! })
                            : undefined
                        }
                      />
                    ))}
                  </div>
                ) : (
                  byGeneration(people).map(([g, ids]) => (
                    <section key={String(g)} className="list">
                      <h2 className="section-title">
                        {g ? t('generation', { n: g }) : t('generationUnknown')}
                      </h2>
                      {ids.map((id) => (
                        <PersonRow key={id} id={id} person={people[id]} />
                      ))}
                    </section>
                  ))
                )}
              </>
            )}
          </main>
        );
      }}
    </FamilyGate>
  );
}

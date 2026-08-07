import json
from pathlib import Path

p = json.loads(Path(__file__).with_name('data').joinpath('schedule.json').read_text())
stages = p['stages']
assert len(stages) == 7
assert {s['name'] for s in stages} == {'Main Stage','MG Stage','Garden Stage','TSP&CO Stage','Joged Stage','TSP Squad Stage','Musicverse Stage'}
rows = [(stage['name'], t, artist) for stage in stages for t, artist in stage['events']]
assert len(rows) == len(set(rows))
assert all(len(t) == 5 and t[2] == '.' for _, t, _ in rows)
for stage in stages:
    times = [int(t[:2]) * 60 + int(t[3:]) for t, _ in stage['events']]
    assert times == sorted(times), stage['name']
main = dict(stages[0]['events'])
for t, artist in {'15.30':'510','16.45':'Kangen Band','19.00':'Barasuara','20.30':'Neck Deep (UK)','22.00':'Wali','23.15':'King Nassar'}.items():
    assert main[t] == artist
mg = dict(next(s['events'] for s in stages if s['name'] == 'MG Stage'))
assert mg['17.00'] == 'ELEVENTWELFTH'
assert mg['18.45'] == 'MKY BOOTS'
assert not any(day in artist for _, _, artist in rows for day in ('DAY 1', 'DAY 3'))
print(f'OK: {len(rows)} events, {len(stages)} stages')

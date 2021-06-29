import { writable } from 'svelte/store';
import { sortBy } from 'lodash-es';

import { areAllSelected, areAllUnselected } from '../utils/logic';

import { statusLevels } from '../utils/status';

function createMultiFilter() {
  const { subscribe, set, update } = writable([]);

  const init = (data, col = null) => {
    let values = data;
    if (col !== null) {
      values = [
        ...new Set(
          data
            .map((d) => {
              return col.split('.').reduce((acc, cur) => acc[cur], d);
            })
            .flat()
        ),
      ];
      values = sortBy(values, d => d.toLowerCase());
    }
    set(
      values.map((value) => {
        return {
          id: value,
          name: value,
          selected: true,
        };
      })
    );
  };

  const unselect = (id) =>
    update((f) =>
      f.map((d) => ({
        ...d,
        selected: [id].flat().includes(d.id) ? false : d.selected,
      }))
    );

  const unselectAll = () =>
    update((f) => f.map((d) => ({ ...d, selected: false })));

  const select = (id) =>
    update((f) =>
      f.map((d) => ({
        ...d,
        selected: [id].flat().includes(d.id) ? true : d.selected,
      }))
    );

  const selectOne = (id) => {
    unselectAll();
    select(id);
  };

  const selectAll = () =>
    update((f) => f.map((d) => ({ ...d, selected: true })));

  const click = (id) =>
    update((f) => {
      let res = [];
      if (areAllSelected(f)) {
        res = f.map((d) => ({
          ...d,
          selected: [id].flat().includes(d.id),
        }));
      } else {
        res = f.map((d) => ({
          ...d,
          selected: [id].flat().includes(d.id) ? !d.selected : d.selected,
        }));
      }
      if (areAllUnselected(res)) {
        res = res.map(d => ({...d, selected: true}));
      }
      return res;
    });

  const applyBoolArray = (arr) => {
    const tmpArr = [...arr].reverse();
    update((f) =>
      f
        .reverse()
        .map((d, i) => ({
          ...d,
          selected: tmpArr[i] !== undefined ? tmpArr[i] : false,
        }))
        .reverse()
    );
  };

  return {
    subscribe,
    set,
    init,
    select,
    selectOne,
    selectAll,
    unselect,
    unselectAll,
    click,
    applyBoolArray,
  };
}

export const statusFilter = createMultiFilter();
export const countryFilter = createMultiFilter();
export const useCaseFilter = createMultiFilter();
export const technologyFilter = createMultiFilter();
export const architectureFilter = createMultiFilter();
export const infrastructureFilter = createMultiFilter();
export const accessFilter = createMultiFilter();
export const corporatePartnershipFilter = createMultiFilter();
export const crossborderPartnershipsFilter = createMultiFilter();

export const initFilters = (data) => {
  statusFilter.init(statusLevels.map((d) => d.name));
  countryFilter.init(data, 'name');
  useCaseFilter.init(data, 'categories.use_case');
  technologyFilter.init(data, 'categories.technology');
  architectureFilter.init(data, 'categories.architecture');
  infrastructureFilter.init(data, 'categories.infrastructure');
  accessFilter.init(data, 'categories.access');
  corporatePartnershipFilter.init(data, 'categories.corporate_partnership');
  crossborderPartnershipsFilter.init(
    data,
    'categories.crossborder_partnerships'
  );
};

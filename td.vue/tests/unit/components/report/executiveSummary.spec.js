import { BootstrapVue, BCard } from 'bootstrap-vue';
import { shallowMount, createLocalVue } from '@vue/test-utils';

import TdExecutiveSummary from '@/components/report/ExecutiveSummary.vue';

describe('components/report/ExecutiveSummary.vue', () => {
  let propsData, wrapper;

  const getData = () => ({
    summary: 'some summary',
    threats: [
      { status: 'Open', severity: 'High' },
      { status: 'Open', severity: 'Medium' },
      { status: 'NotApplicable', severity: 'Low' },
      { status: 'Open', severity: 'Low' },
      { status: 'Open', severity: '' },
      { status: 'Mitigated', severity: '' }
    ]
  });

  const setup = (data) => {
    const localVue = createLocalVue();
    localVue.use(BootstrapVue);
    wrapper = shallowMount(TdExecutiveSummary, {
      localVue,
      propsData: {
        summary: data.summary,
        threats: data.threats
      },
      mocks: {
        $t: t => t
      }
    });
  };

  beforeEach(() => {
    propsData = getData();
    setup(propsData);
  });

  it('displays the executive summary title', () => {
    const summary = wrapper.findComponent(BCard);
    expect(summary.attributes('header')).toEqual('report.executiveSummary');
  });

  it('displays the description title', () => {
    expect(wrapper.find('.td-description-title').text())
      .toEqual('threatmodel.description');
  });

  it('displays the summary', () => {
    expect(wrapper.find('.td-summary').text())
      .toEqual(propsData.summary);
  });

  it('displays the report summary subtitle', () => {
    expect(wrapper.find('.td-report-summary').text())
      .toEqual('report.summary');
  });

  it('gets only the open threats', () => {
    expect(wrapper.vm.getOpenThreats()).toHaveLength(4);
  });

  it('counts the total threats', () => {
    expect(TdExecutiveSummary.computed.total.call(propsData))
      .toEqual(6);
  });

  it('counts the mitigated threats', () => {
    expect(TdExecutiveSummary.computed.mitigated.call(propsData))
      .toEqual(1);
  });

  it('counts the unmitigated threats', () => {
    expect(TdExecutiveSummary.computed.notMitigated.call(propsData))
      .toEqual(5);
  });

  it('gets the data test id from the row item', () => {
    const item = { name: 'foo' };
    const res = wrapper.vm.getDataTestId(item);
    expect(res['data-test-id']).toEqual(item.name);
  });
});

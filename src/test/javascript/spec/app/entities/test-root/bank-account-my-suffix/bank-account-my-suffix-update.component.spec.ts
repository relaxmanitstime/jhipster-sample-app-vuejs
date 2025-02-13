/* tslint:disable max-line-length */
import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils';
import sinon, { SinonStubbedInstance } from 'sinon';
import Router from 'vue-router';
import { ToastPlugin } from 'bootstrap-vue';

import dayjs from 'dayjs';
import { DATE_TIME_LONG_FORMAT } from '@/shared/date/filters';

import * as config from '@/shared/config/config';
import BankAccountMySuffixUpdateComponent from '@/entities/test-root/bank-account-my-suffix/bank-account-my-suffix-update.vue';
import BankAccountMySuffixClass from '@/entities/test-root/bank-account-my-suffix/bank-account-my-suffix-update.component';
import BankAccountMySuffixService from '@/entities/test-root/bank-account-my-suffix/bank-account-my-suffix.service';

import UserService from '@/entities/user/user.service';

import OperationService from '@/entities/test-root/operation/operation.service';
import AlertService from '@/shared/alert/alert.service';

const localVue = createLocalVue();

config.initVueApp(localVue);
const i18n = config.initI18N(localVue);
const store = config.initVueXStore(localVue);
const router = new Router();
localVue.use(Router);
localVue.use(ToastPlugin);
localVue.component('font-awesome-icon', {});
localVue.component('b-input-group', {});
localVue.component('b-input-group-prepend', {});
localVue.component('b-form-datepicker', {});
localVue.component('b-form-input', {});

describe('Component Tests', () => {
  describe('BankAccountMySuffix Management Update Component', () => {
    let wrapper: Wrapper<BankAccountMySuffixClass>;
    let comp: BankAccountMySuffixClass;
    let bankAccountServiceStub: SinonStubbedInstance<BankAccountMySuffixService>;

    beforeEach(() => {
      bankAccountServiceStub = sinon.createStubInstance<BankAccountMySuffixService>(BankAccountMySuffixService);

      wrapper = shallowMount<BankAccountMySuffixClass>(BankAccountMySuffixUpdateComponent, {
        store,
        i18n,
        localVue,
        router,
        provide: {
          bankAccountService: () => bankAccountServiceStub,
          alertService: () => new AlertService(),

          userService: () => new UserService(),

          operationService: () =>
            sinon.createStubInstance<OperationService>(OperationService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
        },
      });
      comp = wrapper.vm;
    });

    describe('load', () => {
      it('Should convert date from string', () => {
        // GIVEN
        const date = new Date('2019-10-15T11:42:02Z');

        // WHEN
        const convertedDate = comp.convertDateTimeFromServer(date);

        // THEN
        expect(convertedDate).toEqual(dayjs(date).format(DATE_TIME_LONG_FORMAT));
      });

      it('Should not convert date if date is not present', () => {
        expect(comp.convertDateTimeFromServer(null)).toBeNull();
      });
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', async () => {
        // GIVEN
        const entity = { id: 123 };
        comp.bankAccount = entity;
        bankAccountServiceStub.update.resolves(entity);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(bankAccountServiceStub.update.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        comp.bankAccount = entity;
        bankAccountServiceStub.create.resolves(entity);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(bankAccountServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        const foundBankAccountMySuffix = { id: 123 };
        bankAccountServiceStub.find.resolves(foundBankAccountMySuffix);
        bankAccountServiceStub.retrieve.resolves([foundBankAccountMySuffix]);

        // WHEN
        comp.beforeRouteEnter({ params: { bankAccountId: 123 } }, null, cb => cb(comp));
        await comp.$nextTick();

        // THEN
        expect(comp.bankAccount).toBe(foundBankAccountMySuffix);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        comp.previousState();
        await comp.$nextTick();

        expect(comp.$router.currentRoute.fullPath).toContain('/');
      });
    });
  });
});

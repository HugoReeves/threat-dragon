import { localRoutes } from '@/router/local.js';

describe('routes/local.js', () => {
    describe('ThreatModel', () => {
        let route;

        beforeEach(() => {
            route = localRoutes
                .find(x => x.name === 'localThreatModel');
        });

        it('uses the expected path', () => {
            expect(route.path).toEqual('/local/:threatmodel');
        });

        it('uses the ThreatModel view as a lazily loaded component', async () => {
            const cmp = await route.component();
            expect(cmp.default.name).toEqual('ThreatModel');
        });
    });

    describe('ThreatModel Edit', () => {
        let route;

        beforeEach(() => {
            route = localRoutes
                .find(x => x.name === 'localThreatModelEdit');
        });

        it('uses the expected path', () => {
            expect(route.path).toEqual('/local/:threatmodel/edit');
        });

        it('uses the ThreatModelEdit view as a lazily loaded component', async () => {
            const cmp = await route.component();
            expect(cmp.default.name).toEqual('ThreatModelEdit');
        });
    });

    describe('Diagram Edit', () => {
        let route;

        beforeEach(() => {
            route = localRoutes
                .find(x => x.name === 'localDiagramEdit');
        });

        it('uses the expected path', () => {
            expect(route.path).toEqual('/local/:threatmodel/edit/:diagram');
        });

        it('uses the Diagram view as a lazily loaded component', async () => {
            const cmp = await route.component();
            expect(cmp.default.name).toEqual('Diagram');
        });
    });


    describe('NewThreatModel', () => {
        let route;

        beforeEach(() => {
            route = localRoutes
                .find(x => x.name === 'localNewThreatModel');
        });

        it('uses the expected path', () => {
            expect(route.path).toEqual('/local/threatmodel/new');
        });

        it('uses the NewThreatModel view as a lazily loaded component', async () => {
            const cmp = await route.component();
            expect(cmp.default.name).toEqual('NewThreatModel');
        });
    });
});
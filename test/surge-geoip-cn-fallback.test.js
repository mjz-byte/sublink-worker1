import { describe, it, expect } from 'vitest';
import { SurgeConfigBuilder } from '../src/builders/SurgeConfigBuilder.js';

const input = 'hysteria2://580ef251-af2b-49f4-aea4-56a8a8f7a391@demo.de:8443?sni=demo.de#HK-HY2';

async function buildRuleLines(selectedRules) {
    const builder = new SurgeConfigBuilder(input, selectedRules, [], null, 'zh-CN', null, false);
    const result = await builder.build();
    const section = result.split('[Rule]')[1] || '';
    return section.split('\n').map(line => line.trim()).filter(Boolean);
}

describe('Surge GEOIP,CN fallback', () => {
    it('adds GEOIP,CN right before FINAL when Location:CN is selected', async () => {
        const lines = await buildRuleLines('minimal');
        const finalIndex = lines.findIndex(line => line.startsWith('FINAL,'));
        const cnIpRule = lines.find(line => line.includes('/geoip/cn.txt,'));
        const cnPolicy = cnIpRule.split(',')[2];

        expect(lines[finalIndex - 1]).toBe(`GEOIP,CN,${cnPolicy}`);
        expect(lines.filter(line => line.startsWith('GEOIP,'))).toHaveLength(1);
    });

    it('omits GEOIP,CN when Location:CN is not selected', async () => {
        const lines = await buildRuleLines(['Non-China']);

        expect(lines.some(line => line.startsWith('GEOIP,'))).toBe(false);
    });
});

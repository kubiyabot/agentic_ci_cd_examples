/**
 * Environment-dependent tests
 * ⚠️ FLAKY - Behavior depends on time, date, and environment
 */

describe('Environment Dependent Tests - FLAKY', () => {
  it('should pass only during work hours', () => {
    const hour = new Date().getHours();

    // Fails outside of 9 AM - 5 PM
    expect(hour).toBeGreaterThanOrEqual(9);
    expect(hour).toBeLessThan(17);
  });

  it('should pass only on weekdays', () => {
    const day = new Date().getDay();

    // Fails on weekends (0 = Sunday, 6 = Saturday)
    expect(day).toBeGreaterThan(0);
    expect(day).toBeLessThan(6);
  });

  it('should pass based on current month', () => {
    const month = new Date().getMonth() + 1; // 1-12

    // Fails during summer months (July, August)
    expect(month).not.toBe(7);
    expect(month).not.toBe(8);
  });

  it('should depend on timestamp seconds', () => {
    const seconds = new Date().getSeconds();

    // Fails when seconds is a multiple of 5
    expect(seconds % 5).not.toBe(0);
  });

  it('should fail on specific dates', () => {
    const today = new Date();
    const dayOfMonth = today.getDate();

    // Fails on the 13th of any month (Friday the 13th paranoia!)
    expect(dayOfMonth).not.toBe(13);
  });

  it('should depend on environment variables', () => {
    // Flaky if environment doesn't have this variable set correctly
    const nodeEnv = process.env.NODE_ENV || 'development';

    // This assumption might not hold in all environments
    expect(nodeEnv).toBe('test');
  });

  it('should fail based on system locale', () => {
    const locale = new Intl.DateTimeFormat().resolvedOptions().locale;

    // Flaky - assumes US locale
    expect(locale).toContain('en-US');
  });
});

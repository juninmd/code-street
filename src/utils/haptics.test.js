import { triggerHaptic } from './haptics';

describe('triggerHaptic', () => {
  let vibrateMock;

  beforeEach(() => {
    vibrateMock = jest.fn();
    Object.defineProperty(global, 'navigator', {
      value: {
        vibrate: vibrateMock,
      },
      writable: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call vibrate with 50ms for success', () => {
    triggerHaptic('success');
    expect(vibrateMock).toHaveBeenCalledWith(50);
  });

  it('should call vibrate with pattern for error', () => {
    triggerHaptic('error');
    expect(vibrateMock).toHaveBeenCalledWith([50, 50, 50]);
  });

  it('should call vibrate with 200ms for heavy', () => {
    triggerHaptic('heavy');
    expect(vibrateMock).toHaveBeenCalledWith(200);
  });

  it('should call vibrate with pattern for notification', () => {
    triggerHaptic('notification');
    expect(vibrateMock).toHaveBeenCalledWith([100, 50, 100]);
  });

  it('should not throw if navigator is undefined', () => {
    Object.defineProperty(global, 'navigator', {
      value: undefined,
      writable: true
    });
    expect(() => triggerHaptic('success')).not.toThrow();
  });
});

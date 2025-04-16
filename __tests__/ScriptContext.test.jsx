// ScriptContext.test.jsx
import { renderHook } from '@testing-library/react'
import { useScript } from "@/context/ScriptContext";

describe("ScriptContext", () => {
  test("throws error when useScript is used outside of ScriptProvider", () => {
    const consoleSpy = jest.spyOn(console, 'error');
    consoleSpy.mockImplementation(() => {});
    
    expect(() => {
        renderHook(() => useScript());
    }).toThrow('useScript must be used within a ScriptProvider');
    
    consoleSpy.mockRestore();
  });
});

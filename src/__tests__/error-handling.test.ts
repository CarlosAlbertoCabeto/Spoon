// /src/__tests__/error-handling.test.ts
describe('Error Handling', () => {
    test('maneja errores de Firebase correctamente', () => {
      const error = new FirebaseError('permission-denied', 'No access');
      const resultado = manejadorErrores(error);
      expect(resultado.tipo).toBe('PERMISOS');
    });
  });
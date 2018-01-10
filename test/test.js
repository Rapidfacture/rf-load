// test libs
var expect = require('expect.js')

// rf-load module
var ModuleLoader = new (require('../index.js').moduleLoader)()


describe('setup', function () {
   it('requires the module of rf-load', function () {
      expect(ModuleLoader).not.to.be(undefined)
   })
})

describe('set module paths', function () {
   it("doesn't load an invalid path", function () {
      expect(ModuleLoader.setModulePath).withArgs('').to.throwException()
      expect(ModuleLoader.setModulePath).withArgs('*.js').to.throwException()
      expect(ModuleLoader.setModulePath).withArgs('*').to.throwException()
   })
   it('loads a valid module path', function () {
      expect(ModuleLoader.setModulePath('.')).to.be.ok()
   })
})

describe('load files', function () {
   it("doesn't throw an error if module is valid string", function () {
      expect(ModuleLoader.file).withArgs('randomModule').to.not.throwException()
   })
   it('throw if module name invalid', function () {
      expect(ModuleLoader.file).withArgs('noFile.js').to.throwException()
   })
})

describe('load modules', function () {
   it('no matter what is passed to the ModuleLoader, it should call the loadFunction', function () {
      expect(ModuleLoader.module).withArgs('randomModule').to.not.throwException()
      expect(ModuleLoader.module).withArgs('randomModule').to.be.a('function') // can only check typeof
   })
   it('should push the module to the list, no matter what', function () {
      expect(ModuleLoader.func).withArgs(null, null, 'randomModule', { require: 'path/to/neverland' }).to.be.ok()
   })
})

describe('actually start the modules', function () {
   it('should not start non-exisiting modules', function () {
      expect(ModuleLoader.startModules).to.throwException() // the random Module is now in the module list
   })
   it.only('should start exisiting module', function () {
      ModuleLoader.startModules(true)
      expect(ModuleLoader.setModulePath('.')).to.be.ok()
      expect(ModuleLoader.module).withArgs('test').to.not.throwException()
      expect(ModuleLoader.func).withArgs(null, null, 'testFile', { require: './testFile.js' }).to.be.ok()
      console.log('Why is it not pushed to the modulelist', ModuleLoader.modulelist)
      expect(ModuleLoader.startModules).to.not.throwException()
   })
})

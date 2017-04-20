import React from 'react';
import { mount } from 'enzyme';
import chaiEnzyme from 'chai-enzyme';
import chai, { expect } from 'chai';
import { ComplexControl } from 'src/components/ComplexControl.jsx';
import sinon from 'sinon';
import { Error } from 'src/Error';

chai.use(chaiEnzyme());
const sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon);


describe('ComplexControl', () => {
  let onChangeSpy;
  let wrapper;
  beforeEach(() => {
    onChangeSpy = sinon.spy();
    wrapper = mount(
      <ComplexControl
        formFieldPath="test1.1/1-0"
        onChange={onChangeSpy}
        validate={false}
        validations={[]}
      />);
  });

  it('should render ComplexControl', () => {
    expect(wrapper.find('input')).to.have.prop('type').to.eql('file');
  });

  it('should upload file to server', () => {
    const response = {
      json: () => {},
    };
    window.fetch = () => {};
    const fetchPromise = sinon.stub(window, 'fetch').returnsPromise();
    const responsePromise = sinon.stub(response, 'json').returnsPromise();
    fetchPromise.resolves(response);
    responsePromise.resolves({ url: 'someUrl' });

    const result = 'data:image/jpeg;base64,/9j/4SumRXhpZgAATU';
    const stub = sinon.stub(FileReader.prototype, 'readAsDataURL', function () {
      this.onloadend({ target: { result } });
    });
    const uploadSpy = sinon.spy(wrapper.instance(), '_uploadFile');

    wrapper.find('input').simulate('change', { target: { files: [{}] } });

    sinon.assert.calledOnce(uploadSpy.withArgs(result));
    sinon.assert.calledOnce(onChangeSpy.withArgs('someUrl'));
    stub.restore();
  });
});

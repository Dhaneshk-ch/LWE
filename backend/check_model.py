import tensorflow as tf
import numpy as np
import os

model_path = os.path.join(os.getcwd(), 'model', 'emotion_model_tf')
model = tf.saved_model.load(model_path)
concrete_func = model.signatures['serving_default']

print('=== MODEL SPECIFICATIONS ===')
print('\nInputs:')
for inp in concrete_func.inputs:
    print(f'  Name: {inp.name}')
    print(f'  Shape: {inp.shape}')
    print(f'  Dtype: {inp.dtype}')

print('\nOutputs:')
for out in concrete_func.outputs:
    print(f'  Name: {out.name}')
    print(f'  Shape: {out.shape}')
    print(f'  Dtype: {out.dtype}')

# Test with dummy input
print('\n=== TEST INFERENCE ===')
test_input = np.random.randn(1, 48, 48, 1).astype(np.float32)
test_input = tf.constant(test_input)
result = concrete_func(test_input)

print('\nTest prediction output:')
if isinstance(result, dict):
    for key, val in result.items():
        print(f'  {key}: shape={val.shape}, dtype={val.dtype}')
        print(f'  Values: {val.numpy()[0]}')
        print(f'  Sum: {np.sum(val.numpy()[0])}')
else:
    print(f'  Shape: {result.shape}')
    print(f'  Values: {result.numpy()[0]}')
    print(f'  Sum: {np.sum(result.numpy()[0])}')

import os
import numpy as np
import librosa
from transformers import AutoFeatureExtractor
from transformers import TFWav2Vec2Model

def get_feature(file_path: str, mfcc_len: int = 39, mean_signal_length: int = 110000):
    signal, fs = librosa.load(file_path)
    s_len = len(signal)

    if s_len < mean_signal_length:
        pad_len = mean_signal_length - s_len
        pad_rem = pad_len % 2
        pad_len //= 2
        signal = np.pad(signal, (pad_len, pad_len + pad_rem), 'constant', constant_values = 0)
    else:
        pad_len = s_len - mean_signal_length
        pad_len //= 2
        signal = signal[pad_len:pad_len + mean_signal_length]
    mfcc = librosa.feature.mfcc(y=signal, sr=fs, n_mfcc=39)
    mfcc = mfcc.T
    feature = mfcc
    return feature

from tqdm import tqdm
lst = []
path = '/ravdess'

for subdir, dirs, files in tqdm(os.walk(path)):
    for file in files:
        try:
            X, sample_rate = librosa.load(os.path.join(subdir, file),
                                          res_type='kaiser_fast')
            #
            file = int(file[7:8]) - 1
            arr = X[:64000], file
            lst.append(arr)
        except ValueError as err:
            print(err)
            continue

X, y = zip(*lst)
X, y = np.asarray(X), np.asarray(y)

MAX_DURATION = 2
# Sampling rate is the number of samples of audio recorded every second
SAMPLING_RATE = 16000
BATCH_SIZE = 2  # Batch-size for training and evaluating our model.
NUM_CLASSES = 8  # Number of classes our dataset will have (11 in our case).
HIDDEN_DIM = 768  # Dimension of our model output (768 in case of Wav2Vec 2.0 - Base).
MAX_SEQ_LENGTH = MAX_DURATION * SAMPLING_RATE  # Maximum length of the input audio file.
# Wav2Vec 2.0 results in an output frequency with a stride of about 20ms.
MAX_FRAMES = 99
MAX_EPOCHS = 5  # Maximum number of training epochs.

MODEL_CHECKPOINT = "facebook/wav2vec2-base"

RAVDESS_CLASS_LABELS = ("angry", "calm", "disgust", "fear", "happy", "neutral","sad","surprise")

labels = RAVDESS_CLASS_LABELS
label2id, id2label = dict(), dict()
for i, label in enumerate(labels):
    label2id[label] = str(i)
    id2label[str(i)] = label


feature_extractor = AutoFeatureExtractor.from_pretrained(
    MODEL_CHECKPOINT, return_attention_mask=True
)


audio_arrays = X
inputs = feature_extractor(
    audio_arrays,
    sampling_rate=feature_extractor.sampling_rate,
    max_length=MAX_SEQ_LENGTH,
    truncation=True,
    padding=True,
)



def mean_pool(hidden_states, feature_lengths):
    attenion_mask = tf.sequence_mask(
        feature_lengths, maxlen=MAX_FRAMES, dtype=tf.dtypes.int64
    )
    padding_mask = tf.cast(
        tf.reverse(tf.cumsum(tf.reverse(attenion_mask, [-1]), -1), [-1]),
        dtype=tf.dtypes.bool,
    )
    hidden_states = tf.where(
        tf.broadcast_to(
            tf.expand_dims(~padding_mask, -1), (BATCH_SIZE, MAX_FRAMES, HIDDEN_DIM)
        ),
        0.0,
        hidden_states,
    )
    pooled_state = tf.math.reduce_sum(hidden_states, axis=1) / tf.reshape(
        tf.math.reduce_sum(tf.cast(padding_mask, dtype=tf.dtypes.float32), axis=1),
        [-1, 1],
    )
    return pooled_state


class TFWav2Vec2ForAudioClassification(keras.Model):

    def __init__(self, model_checkpoint):
        super().__init__()
        # Instantiate the Wav2Vec 2.0 model without the Classification-Head
        self.wav2vec2 = TFWav2Vec2Model.from_pretrained(
            model_checkpoint, apply_spec_augment=False, from_pt=True
        )
        self.pooling = layers.GlobalAveragePooling1D()
        self.flat = layers.Flatten()
        self.intermediate_layer_dropout = layers.Dropout(0.5)

    def call(self, inputs):
        hidden_states = self.wav2vec2(inputs[0])[0]
        if tf.is_tensor(inputs[1]):
            audio_lengths = tf.cumsum(inputs[1], -1)[:, -1]
            feature_lengths = self.wav2vec2.wav2vec2._get_feat_extract_output_lengths(
                audio_lengths
            )
            pooled_state = mean_pool(hidden_states, feature_lengths)
        else:
            pooled_state = self.pooling(hidden_states)

        intermediate_state = self.flat(self.intermediate_layer_dropout(pooled_state))

        return intermediate_state

input = [keras.Input(shape=(MAX_SEQ_LENGTH,), dtype="float32"),
      keras.Input(shape=(MAX_SEQ_LENGTH,), dtype="int32"),
]

wav2vec2_model = TFWav2Vec2ForAudioClassification(MODEL_CHECKPOINT)
wav =wav2vec2_model(input)
output = layers.Dense(NUM_CLASSES, activation="softmax")(wav)
# Model
model = keras.Model(inputs, output)
# Loss
loss = keras.losses.CategoricalCrossentropy(from_logits=False)
# Optimizer
optimizer = keras.optimizers.Adam(learning_rate=1e-5)
# Compile and return
model.compile(loss=loss, optimizer=optimizer, metrics=["accuracy"])
train_x = [y for x, y in inputs.items()]
tx = np.array(train_x)

model.fit(
    [tx[0],tx[1]],
    y,
    batch_size=BATCH_SIZE,
    epochs=1,
)

feats = wav2vec2_model.predict([tx[0],tx[1]],batch_size=2)
import sklearn
from sklearnex import patch_sklearn, unpatch_sklearn
patch_sklearn()
import xgboost as xgb

xgb_params = {
    'objective':                    'binary:logistic',
    'predictor':                    'cpu_predictor',
    'disable_default_eval_metric':  'true',
}

# Train the model
warnings.simplefilter(action='ignore', category=UserWarning)
t1_start = perf_counter()  # Time fit function
model_xgb= xgb.XGBClassifier(**xgb_params)
model_xgb.fit(feats,y)
t1_stop = perf_counter()
print ("It took", t1_stop-t1_start," to fit.")

t1_start = perf_counter()  # Time fit function
model_xgb.predict(feats)
t1_stop = perf_counter()
print ("It took", t1_stop-t1_start," to fit.")

unpatch_sklearn()
xgb_params = {
    'objective':                    'binary:logistic',
    'predictor':                    'cpu_predictor',
    'disable_default_eval_metric':  'true',
}

# Train the model
warnings.simplefilter(action='ignore', category=UserWarning)
t1_start = perf_counter()  # Time fit function
model_xgb= xgb.XGBClassifier(**xgb_params)
model_xgb.fit(feats,y)
t1_stop = perf_counter()
print ("It took", t1_stop-t1_start," to fit.")

t1_start = perf_counter()  # Time fit function
model_xgb.predict(feats)
t1_stop = perf_counter()
print ("It took", t1_stop-t1_start," to fit.")
